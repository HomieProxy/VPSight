
'use client';
import React, { useState, useEffect } from 'react';
import type { VpsData } from '@/types/vps-data';
import { TableCell, TableRow } from '@/components/ui/table';
import { StatusIndicator } from './StatusIndicator';
import { UsageBar } from './UsageBar';
import { Button } from '@/components/ui/button';
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
import { useToast } from "@/hooks/use-toast";
import { renewVpsInstance } from '@/app/admin/actions';
import { 
  ComputerIcon, 
  GlobeIcon, 
  ArrowDownIcon, 
  ArrowUpIcon, 
  CalendarClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ServerOffIcon,
  RefreshCcwIcon,
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
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
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

export function VpsTableRow({ vps, onActionSuccess }: VpsTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewalJustCompleted, setRenewalJustCompleted] = useState(false);
  const { toast } = useToast();

  // Reset renewalJustCompleted if vps.id changes (e.g. list is reordered/filtered)
  useEffect(() => {
    setRenewalJustCompleted(false);
  }, [vps.id]);

  const formatDaysToExpiry = (days: number | string) => {
    if (typeof days === 'string') return days; 
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    return `${days}d`;
  };
  
  const DetailItem: React.FC<{ icon?: React.ReactNode; label: string; children: React.ReactNode; className?: string }> = ({ icon, label, children, className }) => (
    <div className={cn("flex items-start py-0.5 text-xs", className)}>
      {icon && <span className="mr-2 mt-px text-muted-foreground">{icon}</span>}
      <span className="font-medium w-28 shrink-0 text-muted-foreground">{label}:</span>
      <span className="flex-1 break-words text-foreground">{children}</span>
    </div>
  );

  const canRenew = typeof vps.daysToExpiry === 'number' && vps.daysToExpiry <= 15 && vps.daysToExpiry >= 0;
  const billingEndDateFormatted = formatBillingDateShort(vps.note_billing_end_date);

  const handleRenew = async () => {
    if (!vps || !vps.id) return;
    setIsRenewing(true);
    try {
      const result = await renewVpsInstance(parseInt(vps.id, 10));
      if (result.success) {
        toast({ title: "Success", description: `VPS ${vps.name} renewed. New expiry: ${formatBillingDateShort(result.data?.newEndDate)}` });
        setRenewalJustCompleted(true); // Set success flag for this row
        onActionSuccess(); 
      } else {
        toast({ title: "Error", description: result.error || "Failed to renew VPS.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred during renewal.", variant: "destructive" });
    } finally {
      setIsRenewing(false);
      setIsRenewDialogOpen(false);
    }
  };


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
            {vps.system === 'Unknown OS' ? 
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
          <div className="flex items-center gap-1.5 min-w-[150px] justify-start">
            <CalendarClockIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="mr-1">{formatDaysToExpiry(vps.daysToExpiry)}</span>
            {renewalJustCompleted && !canRenew && ( // Show check if renewed and no longer renewable
                <CheckCircle2Icon className="h-4 w-4 text-green-500" title="Renewed successfully" />
            )}
            {canRenew && !renewalJustCompleted && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-1.5 py-0 text-xs"
                onClick={(e) => { e.stopPropagation(); setIsRenewDialogOpen(true); }}
                disabled={isRenewing}
                title="Renew Subscription"
              >
                {isRenewing ? <Loader2Icon className="h-3 w-3 animate-spin" /> : <RefreshCcwIcon className="h-3 w-3"/>}
                <span className="ml-1 hidden sm:inline">Renew</span>
              </Button>
            )}
             {renewalJustCompleted && canRenew && ( // If still renewable after completion (e.g. very short cycle), show both
                <>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-1.5 py-0 text-xs"
                    onClick={(e) => { e.stopPropagation(); setIsRenewDialogOpen(true); }}
                    disabled={isRenewing}
                    title="Renew Subscription Again"
                >
                    {isRenewing ? <Loader2Icon className="h-3 w-3 animate-spin" /> : <RefreshCcwIcon className="h-3 w-3"/>}
                </Button>
                <CheckCircle2Icon className="h-4 w-4 text-green-500 ml-1" title="Renewed successfully" />
                </>
            )}
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
                {billingEndDateFormatted ? ` - Expires: ${billingEndDateFormatted}` : (vps.daysToExpiry !== 'N/A' ? ` - ${formatDaysToExpiry(vps.daysToExpiry)}` : '')}
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
      <AlertDialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Renewal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to renew the subscription for VPS: <strong>{vps?.name}</strong>?
              This will extend the billing end date based on its current cycle: <strong>{vps?.billingCycle || 'N/A'}</strong>.
              Current expiry: {billingEndDateFormatted || formatDaysToExpiry(vps.daysToExpiry)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRenewing(false)} disabled={isRenewing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRenew} disabled={isRenewing} className="bg-primary hover:bg-primary/90">
              {isRenewing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isRenewing ? 'Renewing...' : 'Confirm Renew'}
            </AlertDialogAction>
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
          <div className="h-5 bg-muted rounded animate-pulse" style={{ width: i === 1 ? '120px' : i === 6 ? '130px' : (i >= 10 && i <=12) ? '60px' : '50px' }} />
        </TableCell>
      ))}
    </TableRow>
  );
}
