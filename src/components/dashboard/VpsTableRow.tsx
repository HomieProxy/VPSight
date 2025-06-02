
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

interface VpsTableRowProps {
  vps: VpsData;
  onActionSuccess: () => void;
}

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
      // For monthly, totalDaysInCycle should be days in the month leading up to endDate
      // If endDate is Feb 28th (after a 1-month cycle from Jan 28th), then totalDaysInCycle is days in Feb.
      // Or, if end date is Mar 1st, and start was Feb 1st, total days is days in Feb.
      // The most accurate is days in the month of the *start* date of the period that *ends* on endDate.
      // So, if endDate is end of March, and it's a monthly cycle, startDate is beginning of March. Total days = days in March.
      const tempStartDateForCalc = addMonths(endDate, -numMonths); // Start of the period that *ends* at endDate
      const daysInPeriodMonth = getDaysInMonth(tempStartDateForCalc);
      const totalDays = differenceInDays(endDate, tempStartDateForCalc); // This could span across month changes for "X months"
                                                                    // A simpler model: for "1 month", use days in the month of the start date.
      if (numMonths === 1) {
         return { startDateISO: formatISO(startDate, { representation: 'date' }), totalDaysInCycle: getDaysInMonth(startDate) };
      }
       // For "X months", it's more complex, sum of days in those months.
       // For simplicity, use differenceInDays for multi-month cycles.
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
        startDate = addDays(endDate, -parseInt(daysMatch[1], 10));
      } else {
         const justDaysNumberMatch = c.match(/^(\d+)$/);
         if (justDaysNumberMatch) {
            startDate = addDays(endDate, -parseInt(justDaysNumberMatch[1], 10));
         } else {
            // Fallback to a sensible default if cycle string is unparseable, e.g., 30 days
            startDate = addDays(endDate, -30); 
            const totalDays = differenceInDays(endDate, startDate);
            return { startDateISO: formatISO(startDate, { representation: 'date' }), totalDaysInCycle: totalDays > 0 ? totalDays : 30 };
         }
      }
    }
    const totalDays = differenceInDays(endDate, startDate);
    return { startDateISO: formatISO(startDate, { representation: 'date' }), totalDaysInCycle: totalDays > 0 ? totalDays : 0 };
  } catch (e) {
    console.error("Error in getCycleDetails:", e);
    return { startDateISO: null, totalDaysInCycle: 0 }; // Fallback
  }
};


export function VpsTableRow({ vps, onActionSuccess }: VpsTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  
  const [isRenewalAcknowledged, setIsRenewalAcknowledged] = useState(false);
  const [isAutoRenewing, setIsAutoRenewing] = useState(false);
  
  // Reset acknowledgment and auto-renewing state if the VPS ID changes
  useEffect(() => {
    setIsRenewalAcknowledged(false);
    setIsAutoRenewing(false);
  }, [vps.id]);

  // Effect for client-side "auto-renewal"
  useEffect(() => {
    const performAutoRenewal = async () => {
      if (
        isRenewalAcknowledged &&
        ((typeof vps.daysToExpiry === 'number' && vps.daysToExpiry <= 0) || vps.daysToExpiry === 'Expired') &&
        !isAutoRenewing // Ensure it's not already trying to renew this instance
      ) {
        setIsAutoRenewing(true); // Set flag to prevent multiple calls
        toast({ 
            title: "Auto-Renewal Triggered", 
            description: `Attempting to auto-renew VPS: ${vps.name} (ID: ${vps.id}). It expired or is about to expire.` 
        });
        try {
          const result = await renewVpsInstance(parseInt(vps.id, 10));
          if (result.success) {
            toast({ 
                title: "Auto-Renewal Successful", 
                description: `VPS ${vps.name} has been auto-renewed. New expiry: ${result.data?.newEndDate}` 
            });
            onActionSuccess(); // Re-fetch data to update the row
            setIsRenewalAcknowledged(false); // Reset acknowledgment for the next cycle
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
          setIsAutoRenewing(false); // Reset flag regardless of outcome
        }
      }
    };
    performAutoRenewal();
  }, [vps.daysToExpiry, isRenewalAcknowledged, vps.id, vps.name, onActionSuccess, toast, isAutoRenewing]);


  const formatDaysToExpiryText = (days: number | string): string => {
    if (typeof days === 'string') return days; 
    if (days < 0) return 'Expired'; // Should be caught by string "Expired" from API ideally
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
    (typeof vps.daysToExpiry === 'number' && vps.daysToExpiry <= 15 && vps.daysToExpiry >= 0) ||
    (vps.daysToExpiry === 'Expired' && vps.note_billing_end_date !== null) // Allow acknowledging expired if it has an end date
  );


  const handleAcknowledgeRenewal = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsRenewalAcknowledged(true);
    toast({ 
      title: "Renewal Acknowledged", 
      description: `VPS ${vps.name} will be auto-renewed upon expiry (or immediately if already expired).` 
    });
  };

  const { totalDaysInCycle } = getCycleDetails(vps.note_billing_end_date, vps.billingCycle);
  
  let daysToDisplayForBar: number | string = vps.daysToExpiry;
  let progressBarPercentage = 0;
  let progressIndicatorColor = "bg-primary"; 

  if (typeof daysToDisplayForBar === 'number') {
    const actualDaysLeftForBar = Math.max(0, daysToDisplayForBar);
    progressBarPercentage = (totalDaysInCycle > 0)
        ? Math.min(100, Math.max(0, (actualDaysLeftForBar / totalDaysInCycle) * 100))
        : 0;

    if (daysToDisplayForBar < 0) { 
      progressIndicatorColor = "bg-muted"; 
    } else if (daysToDisplayForBar <= 7) { 
      progressIndicatorColor = "bg-red-500";
    } else if (daysToDisplayForBar <= 15) { 
      progressIndicatorColor = "bg-orange-500";
    } else { 
      progressIndicatorColor = "bg-green-500";
    }
  } else if (daysToDisplayForBar === 'Expired') {
      progressBarPercentage = 0;
      progressIndicatorColor = "bg-muted"; 
  } else { // N/A or other strings
      progressBarPercentage = 0; 
      progressIndicatorColor = "bg-muted"; 
  }


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
            <GlobeIcon className="h-4 w-4 text-muted-foreground" />
            {vps.location}
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">{vps.price}</TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">{vps.uptime}</TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5 min-w-[150px] sm:min-w-[180px] justify-start">
            {(vps.note_billing_end_date && totalDaysInCycle > 0) || (typeof vps.daysToExpiry === 'string' && (vps.daysToExpiry.toLowerCase() === 'expired' || vps.daysToExpiry.toLowerCase() === 'n/a')) ? (
              <>
                <UsageBar 
                  percentage={progressBarPercentage} 
                  className="w-16 sm:w-20 h-3"
                  barClassName={progressIndicatorColor}
                  showText={false} 
                />
                <span className="text-xs w-auto min-w-[30px] text-right">{formatDaysToExpiryText(vps.daysToExpiry)}</span>
              </>
            ) : (
              <span className="text-xs w-[100px] sm:w-[120px] flex items-center">
                <CalendarDaysIcon className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
                {formatDaysToExpiryText(vps.daysToExpiry)}
              </span>
            )}
            
            {isRenewalAcknowledged ? (
                <CheckCircle2Icon className="h-5 w-5 text-green-500 shrink-0" title={`Renewal acknowledged. Auto-renewal triggered/will trigger upon expiry.`} />
            ) : canAcknowledgeRenewal ? ( 
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-1.5 py-0 text-xs shrink-0"
                onClick={handleAcknowledgeRenewal}
                disabled={isAutoRenewing}
                title="Acknowledge upcoming renewal to enable auto-renewal at expiry"
              >
                {isAutoRenewing ? <Loader2Icon className="h-3 w-3 animate-spin" /> : <BellRingIcon className="h-3 w-3"/>}
              </Button>
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
          <UsageBar percentage={vps.cpu.usage} />
        </TableCell>
        <TableCell className="p-2 w-20 min-w-[80px]">
          <UsageBar percentage={vps.ram.percentage} />
        </TableCell>
        <TableCell className="p-2 w-20 min-w-[80px]">
          <UsageBar percentage={vps.disk.percentage} />
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
    </>
  );
}

export function VpsTableSkeletonRow() {
  return (
    <TableRow className="border-b border-border/50">
      {[...Array(13)].map((_, i) => (
        <TableCell key={i} className="p-2 h-[41px]">
          <div className="flex items-center h-full">
            {i === 6 ? ( 
              <div className="flex items-center gap-1.5">
                <div className="h-3 bg-muted rounded animate-pulse w-16 sm:w-20" /> 
                <div className="h-4 bg-muted rounded animate-pulse w-auto min-w-[30px]" />
                <div className="h-5 bg-muted rounded animate-pulse w-5" />
              </div>
            ) : (
              <div className="h-5 bg-muted rounded animate-pulse" 
                   style={{ 
                     width: i === 1 ? '120px' : 
                            (i >= 10 && i <=12) ? '60px' : '50px' 
                   }} />
            )}
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}
    
