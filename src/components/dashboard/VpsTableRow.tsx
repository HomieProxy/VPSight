
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import type { VpsData } from '@/types/vps-data';
import { TableCell, TableRow } from '@/components/ui/table';
import { StatusIndicator } from './StatusIndicator';
import { UsageBar } from './UsageBar';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { renewVpsInstance } from '@/app/admin/actions';
import { 
  ComputerIcon, 
  GlobeIcon, 
  ArrowDownIcon, 
  ArrowUpIcon, 
  ChevronDownIcon,
  ChevronRightIcon,
  ServerOffIcon,
  Loader2Icon,
  InfoIcon,
  CpuIcon as CpuIconLucide,
  HardDriveIcon,
  MemoryStickIcon as MemoryStickIconLucide,
  NetworkIcon,
  PowerIcon,
  RadioTowerIcon,
  ActivityIcon,
  TagIcon,
  DollarSignIcon,
  CalendarIcon,
  ReplaceIcon,
  FileClockIcon,
  CheckCircle2Icon,
  CalendarDaysIcon,
  BellRingIcon
} from 'lucide-react';
import { format, parseISO, isValid, differenceInDays, isFuture, addMonths, addYears, formatISO, addDays, getDaysInMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatDetailDate = (isoString: string | null | undefined): string => {
  if (!isoString) return 'N/A';
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return 'N/A';
    return format(date, 'Pppp'); 
  } catch (e) {
    console.error("Error formatting detail date:", isoString, e);
    return 'Invalid Date';
  }
};

const formatBillingDateShort = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return '';
    return format(date, 'yyyy-MM-dd');
  } catch (e) {
    return '';
  }
};

// Helper function to get two-letter country code
const getCountryCodeForFlag = (locationString: string | null | undefined): string | null => {
  if (!locationString) return null;
  const upperLocation = locationString.toUpperCase();

  // Map of common country names/codes to two-letter ISO codes (lowercase)
  const countryCodeMap: Record<string, string> = {
    'UNITED STATES': 'us', 'USA': 'us', 'US': 'us',
    'UNITED KINGDOM': 'gb', 'UK': 'gb', 'GB': 'gb', 'GREAT BRITAIN': 'gb',
    'JAPAN': 'jp', 'JP': 'jp',
    'GERMANY': 'de', 'DE': 'de', 'DEUTSCHLAND': 'de',
    'FRANCE': 'fr', 'FR': 'fr',
    'CANADA': 'ca', 'CA': 'ca',
    'AUSTRALIA': 'au', 'AU': 'au',
    'CHINA': 'cn', 'CN': 'cn',
    'INDIA': 'in', 'IN': 'in',
    'BRAZIL': 'br', 'BR': 'br',
    'NETHERLANDS': 'nl', 'NL': 'nl',
    'SINGAPORE': 'sg', 'SG': 'sg',
    'ITALY': 'it', 'IT': 'it',
    'SPAIN': 'es', 'ES': 'es',
    'RUSSIA': 'ru', 'RU': 'ru',
    'SOUTH KOREA': 'kr', 'KR': 'kr',
    'SWEDEN': 'se', 'SE': 'se',
    'SWITZERLAND': 'ch', 'CH': 'ch',
    'NORWAY': 'no', 'NO': 'no',
    'HONG KONG': 'hk', 'HK': 'hk',
    // Add more as needed, ensure value is lowercase 2-letter code
  };

  // 1. Exact match for the whole string (uppercase)
  if (countryCodeMap[upperLocation]) {
    return countryCodeMap[upperLocation];
  }

  // 2. Check if the location string CONTAINS any of the keys (longest keys first)
  const sortedKeys = Object.keys(countryCodeMap).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    const regex = new RegExp(`\\b${escapedKey}\\b`); 
    if (regex.test(upperLocation)) {
      return countryCodeMap[key];
    }
  }
  
  // 3. Fallback: Check individual parts of the location string
  const normalizedParts = upperLocation.replace(/[\/\-\,\.]/g, ' ').split(' ').filter(part => part.length > 0);
  for (const part of normalizedParts) {
    if (countryCodeMap[part]) {
        return countryCodeMap[part];
    }
  }

  // 4. If locationString itself is a valid 2-letter code (and not already caught by map), return it (lowercase)
  if (locationString.length === 2 && /^[a-zA-Z]+$/.test(locationString)) {
    const potentialCode = locationString.toLowerCase();
    // Check if this code is a known value in our map to avoid misinterpreting short location names as codes
    if (Object.values(countryCodeMap).includes(potentialCode)) {
        return potentialCode;
    }
  }
  
  return null; 
};


const getCycleDetails = (
    endDateISO: string | null | undefined, 
    cycleString: string | null | undefined
  ): { startDateISO: string | null, totalDaysInCycle: number } => {
  if (!endDateISO || !cycleString) return { startDateISO: null, totalDaysInCycle: 0 };

  try {
    let endDate = parseISO(endDateISO);
    if (!isValid(endDate)) return { startDateISO: null, totalDaysInCycle: 0 };

    let startDate: Date;
    const c = cycleString.toLowerCase().trim();

    if (c.includes('month')) {
      const monthsMatch = c.match(/(\d+)/);
      const numMonths = monthsMatch ? parseInt(monthsMatch[1], 10) : 1;
      startDate = addMonths(endDate, -numMonths);
      if (numMonths === 1) {
         const tempStartDateForMonthCalc = addMonths(endDate, -1); 
         return { startDateISO: formatISO(startDate, { representation: 'date' }), totalDaysInCycle: getDaysInMonth(tempStartDateForMonthCalc) };
      }
      return { startDateISO: formatISO(startDate, { representation: 'date' }), totalDaysInCycle: differenceInDays(endDate, startDate) };

    } else if (c.includes('year') || c.includes('annu')) {
      const yearsMatch = c.match(/(\d+)/);
      let numYears = yearsMatch ? parseInt(yearsMatch[1], 10) : 1;
      if (c.includes('bi-annu') || c.includes('biannu')) numYears = 2;
      startDate = addYears(endDate, -numYears);
    } else if (c.includes('quarter')) {
      startDate = addMonths(endDate, -3);
    } else { 
      const daysMatch = c.match(/^(\d+)\s*days?$/);
      if (daysMatch) {
        const numDays = parseInt(daysMatch[1], 10);
        startDate = addDays(endDate, -numDays);
        return { startDateISO: formatISO(startDate, { representation: 'date' }), totalDaysInCycle: numDays };
      } else {
         const justDaysNumberMatch = c.match(/^(\d+)$/);
         if (justDaysNumberMatch) {
            const numDays = parseInt(justDaysNumberMatch[1], 10);
            startDate = addDays(endDate, -numDays);
            return { startDateISO: formatISO(startDate, { representation: 'date' }), totalDaysInCycle: numDays };
         } else {
            startDate = addDays(endDate, -30); 
            const totalDays = differenceInDays(endDate, startDate);
            return { startDateISO: formatISO(startDate, { representation: 'date' }), totalDaysInCycle: totalDays > 0 ? totalDays : 30 };
         }
      }
    }
    const totalDays = differenceInDays(endDate, startDate);
    return { startDateISO: formatISO(startDate, { representation: 'date' }), totalDaysInCycle: totalDays > 0 ? totalDays : 0 };
  } catch (e) {
    console.error("Error in getCycleDetails for endDate:", endDateISO, "cycle:", cycleString, e);
    if (endDateISO && isValid(parseISO(endDateISO))) {
        const endDate = parseISO(endDateISO);
        const startDate = addDays(endDate, -30); 
        return { startDateISO: formatISO(startDate, {representation: 'date'}), totalDaysInCycle: 30};
    }
    return { startDateISO: null, totalDaysInCycle: 0 };
  }
};


interface VpsTableRowProps {
  vps: VpsData;
  onActionSuccess: () => void;
}

export function VpsTableRow({ vps, onActionSuccess }: VpsTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  
  const [isRenewalAcknowledged, setIsRenewalAcknowledged] = useState(false);
  const [isAutoRenewing, setIsAutoRenewing] = useState(false);
  const [showConfirmAcknowledgeDialog, setShowConfirmAcknowledgeDialog] = useState(false);

  useEffect(() => {
    setIsRenewalAcknowledged(false);
    setIsAutoRenewing(false); 
  }, [vps.id]);

  const performAutoRenewal = useCallback(async () => {
    const isExpiredOrDue = ((typeof vps.daysToExpiry === 'number' && vps.daysToExpiry <= 0) || vps.daysToExpiry === 'Expired');

    if (isRenewalAcknowledged && isExpiredOrDue && !isAutoRenewing) {
      setIsAutoRenewing(true); 
      toast({ 
          title: "Auto-Renewal Triggered", 
          description: `Attempting to auto-renew VPS: ${vps.name} (ID: ${vps.id}).` 
      });
      try {
        const result = await renewVpsInstance(parseInt(vps.id, 10));
        if (result.success) {
          toast({ 
              title: "Auto-Renewal Successful", 
              description: `VPS ${vps.name} has been auto-renewed. New expiry: ${formatBillingDateShort(result.data?.newEndDate)}` 
          });
          onActionSuccess(); 
          setIsRenewalAcknowledged(false); 
        } else {
          toast({ 
              title: "Auto-Renewal Failed", 
              description: result.error || `Failed to auto-renew VPS ${vps.name}.`, 
              variant: "destructive" 
          });
        }
      } catch (error) {
        toast({ 
          title: "Auto-Renewal Error", 
          description: `An unexpected error occurred during auto-renewal for VPS ${vps.name}.`, 
          variant: "destructive" 
        });
      } finally {
        setIsAutoRenewing(false); 
      }
    }
  }, [vps.daysToExpiry, vps.id, vps.name, isRenewalAcknowledged, isAutoRenewing, onActionSuccess, toast]);

  useEffect(() => {
    performAutoRenewal();
  }, [performAutoRenewal]); 

  const formatDaysToExpiryText = (days: number | string): string => {
    if (typeof days === 'string') return days; 
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires Today';
    return `${days}d`;
  };
  
  const DetailItem: React.FC<{ icon?: React.ReactNode; label: string; children: React.ReactNode; className?: string }> = ({ icon, label, children, className }) => (
    <div className={cn("flex items-start py-0.5 text-xs", className)}>
      {icon && <span className="mr-2 mt-px text-muted-foreground">{icon}</span>}
      <span className="font-medium w-28 shrink-0 text-muted-foreground">{label}:</span>
      <span className="flex-1 break-words text-foreground">{children}</span>
    </div>
  );
  
  const canAcknowledgeRenewal = !isRenewalAcknowledged && (
    ((typeof vps.daysToExpiry === 'number' && vps.daysToExpiry <= 15) || // Includes 0 to 15 days
    (vps.daysToExpiry === 'Expired')) && 
    vps.note_billing_end_date !== null && 
    !isAutoRenewing 
  );

  const handleAcknowledgeRenewalClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setShowConfirmAcknowledgeDialog(true);
  };

  const confirmAcknowledgeRenewal = () => {
    setIsRenewalAcknowledged(true);
    toast({ 
      title: "Renewal Acknowledged", 
      description: `VPS ${vps.name} will be auto-renewed upon expiry.` 
    });
    setShowConfirmAcknowledgeDialog(false);
    if (vps.daysToExpiry === 'Expired' || (typeof vps.daysToExpiry === 'number' && vps.daysToExpiry <=0) ) {
        performAutoRenewal();
    }
  };

  const { totalDaysInCycle } = getCycleDetails(vps.note_billing_end_date, vps.billingCycle);
  
  let daysRemainingForTextDisplay = vps.daysToExpiry;
  let progressBarPercentage = 0;
  let progressIndicatorColorClass = "bg-muted"; 

  if (typeof vps.daysToExpiry === 'number') {
    const actualDaysLeftForBar = Math.max(0, vps.daysToExpiry); 
    progressBarPercentage = (totalDaysInCycle > 0)
        ? Math.min(100, Math.max(0, (actualDaysLeftForBar / totalDaysInCycle) * 100))
        : (actualDaysLeftForBar > 0 ? 100 : 0); 

    if (vps.daysToExpiry < 0) { 
      progressIndicatorColorClass = "bg-red-500"; 
    } else if (vps.daysToExpiry <= 7) { 
      progressIndicatorColorClass = "bg-orange-500"; 
    } else if (vps.daysToExpiry <= 15) { 
      progressIndicatorColorClass = "bg-yellow-500"; 
    } else { 
      progressIndicatorColorClass = "bg-green-500"; 
    }
  } else if (typeof vps.daysToExpiry === 'string' && vps.daysToExpiry.toLowerCase() === 'expired') {
      progressBarPercentage = 0; 
      progressIndicatorColorClass = "bg-red-500"; 
  }

  const countryCode = getCountryCodeForFlag(vps.location);

  return (
    <>
      <TableRow 
        className="hover:bg-muted/20 cursor-pointer border-b border-border/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="p-2 text-center w-12">
          <StatusIndicator status={vps.status} />
        </TableCell>
        <TableCell className="p-2 font-medium text-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            {isExpanded ? <ChevronDownIcon className="h-4 w-4 text-muted-foreground" /> : <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />}
            {vps.name}
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap min-w-[120px]">
          <div className="flex items-center gap-1.5">
            {vps.system === 'Unknown OS' || vps.status === 'offline' ? 
              <ServerOffIcon className="h-4 w-4 text-muted-foreground opacity-70" title="System Unknown / Agent Offline"/> : 
              <> <ComputerIcon className="h-4 w-4 text-muted-foreground" /> {vps.system.split('[')[0].trim()} </>
            }
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            {countryCode ? (
              <span className={cn('fi', `fi-${countryCode}`)} title={vps.location} aria-label={vps.location}></span>
            ) : (
              <GlobeIcon className="h-4 w-4 text-muted-foreground" />
            )}
            {vps.location}
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">{vps.price}</TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">{vps.uptime}</TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5 min-w-[150px] sm:min-w-[180px] justify-start">
            {(vps.note_billing_end_date && totalDaysInCycle >= 0) || (typeof vps.daysToExpiry === 'string') ? (
              <>
                <UsageBar 
                  percentage={progressBarPercentage} 
                  className="w-16 sm:w-20 h-3" 
                  barClassName={progressIndicatorColorClass} 
                  showText={false} 
                />
                <span className="text-xs w-auto min-w-[30px] text-right">{formatDaysToExpiryText(daysRemainingForTextDisplay)}</span>
              </>
            ) : (
              <span className="text-xs w-[100px] sm:w-[120px] flex items-center">
                <CalendarDaysIcon className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
                {formatDaysToExpiryText(daysRemainingForTextDisplay)}
              </span>
            )}
            
            {isRenewalAcknowledged && !isAutoRenewing ? ( 
                <CheckCircle2Icon className="h-5 w-5 text-green-500 shrink-0" title={`Renewal acknowledged. Auto-renewal will trigger upon expiry.`} />
            ) : canAcknowledgeRenewal ? ( 
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-1.5 py-0 text-xs shrink-0"
                onClick={handleAcknowledgeRenewalClick}
                disabled={isAutoRenewing} 
                title="Acknowledge renewal reminder"
              >
                {isAutoRenewing ? <Loader2Icon className="h-3 w-3 animate-spin" /> : <BellRingIcon className="h-3 w-3"/>}
              </Button>
            ) : isAutoRenewing ? ( 
                 <Loader2Icon className="h-5 w-5 text-primary animate-spin shrink-0" title="Auto-renewing..."/>
            ) : null}
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm text-center whitespace-nowrap">{typeof vps.load === 'number' ? vps.load.toFixed(2) : 'N/A'}</TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap min-w-[120px]">
          <div className="flex items-center gap-1">
            <ArrowDownIcon className="h-3 w-3 text-green-500" /> {vps.nicDown}
            <span className="text-muted-foreground mx-0.5">|</span>
            <ArrowUpIcon className="h-3 w-3 text-red-500" /> {vps.nicUp}
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap min-w-[120px]">
          <div className="flex items-center gap-1">
            <ArrowDownIcon className="h-3 w-3 text-green-500" /> {vps.network.currentMonthIn}
            <span className="text-muted-foreground mx-0.5">|</span>
            <ArrowUpIcon className="h-3 w-3 text-red-500" /> {vps.network.currentMonthOut}
          </div>
        </TableCell>
        <TableCell className="p-2 w-20 min-w-[80px]">
          <UsageBar percentage={vps.cpu.usage} showText={true} />
        </TableCell>
        <TableCell className="p-2 w-20 min-w-[80px]">
          <UsageBar percentage={vps.ram.percentage} showText={true} />
        </TableCell>
        <TableCell className="p-2 w-20 min-w-[80px]">
          <UsageBar percentage={vps.disk.percentage} showText={true}/>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/5 hover:bg-muted/10 border-b border-border/50">
          <TableCell colSpan={13} className="p-0">
            <div className="p-3 space-y-1">
              <DetailItem icon={<DollarSignIcon size={14}/>} label="Plan">
                {vps.price || 'N/A'}
                {vps.billingCycle && vps.billingCycle !== 'N/A' ? ` (${vps.billingCycle})` : ''}
                {formatBillingDateShort(vps.note_billing_end_date) ? ` - Expires: ${formatBillingDateShort(vps.note_billing_end_date)}` : (vps.daysToExpiry !== 'N/A' ? ` - ${formatDaysToExpiryText(vps.daysToExpiry)}` : '')}
                {vps.planBandwidth && vps.planBandwidth !== 'N/A' ? ` - BW: ${vps.planBandwidth}` : ''}
                {vps.planTrafficType && vps.planTrafficType !== 'N/A' ? ` - Traffic: ${vps.planTrafficType}` : ''}
                {vps.ip_address ? ` - IP: ${vps.ip_address}` : ''}
              </DetailItem>
              <DetailItem icon={<ComputerIcon size={14}/>} label="System">{vps.system}</DetailItem>
              <DetailItem icon={<CpuIconLucide size={14}/>} label="CPU">
                {vps.cpu.model || 'N/A'} {vps.cpu.cores > 0 ? ` (${vps.cpu.cores} Cores)` : ''} (Usage: {vps.cpu.usage.toFixed(2)}%)
              </DetailItem>
              <DetailItem icon={<HardDriveIcon size={14}/>} label="Disk">
                {vps.disk.used} / {vps.disk.total} ({vps.disk.percentage.toFixed(2)}%)
              </DetailItem>
              <DetailItem icon={<MemoryStickIconLucide size={14}/>} label="RAM">
                {vps.ram.used} / {vps.ram.total} ({vps.ram.percentage.toFixed(2)}%)
              </DetailItem>
              {vps.swap.status === 'OFF' ? (
                <DetailItem icon={<ReplaceIcon size={14}/>} label="Swap">OFF</DetailItem>
              ) : (
                <DetailItem icon={<ReplaceIcon size={14}/>} label="Swap">
                  {vps.swap.used || '0 MB'} / {vps.swap.total || '0 MB'} 
                  {vps.swap.percentage !== undefined && vps.swap.percentage !== null ? ` (${vps.swap.percentage.toFixed(2)}%)` : ''}
                </DetailItem>
              )}
              <DetailItem icon={<NetworkIcon size={14}/>} label="Usage (Total)">
                IN: {vps.network.totalIn} / OUT: {vps.network.totalOut}
              </DetailItem>
              <DetailItem icon={<ActivityIcon size={14}/>} label="Load Avg">
                {Array.isArray(vps.loadAverage) ? vps.loadAverage.map(l => typeof l === 'number' ? l.toFixed(2) : 'N/A').join(' / ') : 'N/A'}
              </DetailItem>
              <DetailItem icon={<InfoIcon size={14}/>} label="Processes">{typeof vps.processCount === 'number' ? vps.processCount : 'N/A'}</DetailItem>
              <DetailItem icon={<RadioTowerIcon size={14}/>} label="Connections">
                TCP: {typeof vps.connections?.tcp === 'number' ? vps.connections.tcp : 'N/A'} / UDP: {typeof vps.connections?.udp === 'number' ? vps.connections.udp : 'N/A'}
              </DetailItem>
              <DetailItem icon={<PowerIcon size={14}/>} label="Boot Time">{formatDetailDate(vps.bootTime)}</DetailItem>
              <DetailItem icon={<FileClockIcon size={14}/>} label="Last Active">{formatDetailDate(vps.lastActive)}</DetailItem>
              <DetailItem icon={<CalendarIcon size={14}/>} label="Uptime">{vps.uptime}</DetailItem>
              <DetailItem icon={<TagIcon size={14}/>} label="Agent Ver">{vps.agentVersion || 'N/A'}</DetailItem>
            </div>
          </TableCell>
        </TableRow>
      )}

      <AlertDialog open={showConfirmAcknowledgeDialog} onOpenChange={setShowConfirmAcknowledgeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acknowledge Renewal Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to acknowledge the renewal reminder for VPS: {vps.name}?
              If acknowledged, the system will attempt to auto-renew this VPS when it expires.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAcknowledgeRenewal}>Acknowledge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function VpsTableSkeletonRow() {
  return (
    <TableRow className="border-b border-border/50">
      {[...Array(13)].map((_, i) => (
        <TableCell key={i} className="p-2 h-[41px]">
          <div className="flex items-center h-full">
            {i === 3 ? ( // Special handling for the "Location" column with flag + text
                 <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse" /> {/* Skeleton for flag icon */}
                    <div className="h-4 bg-muted rounded animate-pulse w-12" /> {/* Skeleton for location text */}
                 </div>
            ) : i === 6 ? ( // Special handling for the "Remaining" column with progress bar + text + button
              <div className="flex items-center gap-1.5 min-w-[150px] sm:min-w-[180px]">
                <div className="h-3 bg-muted rounded animate-pulse w-16 sm:w-20" /> 
                <div className="h-4 bg-muted rounded animate-pulse w-auto min-w-[30px]" /> 
                <div className="h-5 bg-muted rounded animate-pulse w-5" /> 
              </div>
            ) : (
              <div className="h-5 bg-muted rounded animate-pulse" 
                   style={{ 
                     width: i === 1 ? '120px' : 
                            (i === 2 || i === 8 || i === 9) ? '100px' : 
                            (i >= 10 && i <=12) ? '60px' : 
                            '50px' 
                   }} />
            )}
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}
