
'use client';
import React, { useState } from 'react';
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
import { renewVpsInstance } from '@/app/admin/actions'; // Assuming actions are accessible
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
  Loader2Icon
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

interface VpsTableRowProps {
  vps: VpsData;
  onActionSuccess: () => void;
}

const formatFullDate = (isoString: string | null | undefined): string => {
  if (!isoString) return 'N/A';
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return 'N/A';
    return format(date, 'M/d/yyyy, h:mm:ss a');
  } catch (e) {
    console.error("Error formatting date:", isoString, e);
    return 'Invalid Date';
  }
};

const formatBillingDate = (isoString: string | null | undefined): string => {
  if (!isoString) return 'N/A';
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return 'N/A';
    return format(date, 'yyyy-MM-dd');
  } catch (e) {
    return 'Invalid Date';
  }
};

export function VpsTableRow({ vps, onActionSuccess }: VpsTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const { toast } = useToast();

  const formatDaysToExpiry = (days: number | string) => {
    if (typeof days === 'string') return days; 
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    return `${days}d`;
  };
  
  const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-start py-0.5">
      <span className="font-semibold w-32 shrink-0 text-muted-foreground">{label}:</span>
      <span className="flex-1 break-words">{children}</span>
    </div>
  );

  const canRenew = typeof vps.daysToExpiry === 'number' && vps.daysToExpiry <= 15 && vps.daysToExpiry >= 0;

  const handleRenew = async () => {
    if (!vps || !vps.id) return;
    setIsRenewing(true);
    try {
      const result = await renewVpsInstance(parseInt(vps.id, 10));
      if (result.success) {
        toast({ title: "Success", description: `VPS ${vps.name} renewed. New expiry: ${result.data?.newEndDate}` });
        onActionSuccess(); // Refresh the list
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
        className="hover:bg-muted/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="p-2 text-center w-16">
          <StatusIndicator status={vps.status} />
        </TableCell>
        <TableCell className="p-2 font-medium text-sm whitespace-nowrap">
          <div className="flex items-center gap-1">
            {isExpanded ? <ChevronDownIcon className="h-4 w-4 text-muted-foreground" /> : <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />}
            {vps.name}
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1">
            {vps.system === 'Unknown OS' ? 
              <ServerOffIcon className="h-4 w-4 text-destructive" title="System Unknown / Agent Offline"/> : 
              <> <ComputerIcon className="h-4 w-4 text-muted-foreground" /> {vps.system.split('[')[0].trim()} </>
            }
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1">
            <GlobeIcon className="h-4 w-4 text-muted-foreground" />
            {vps.location}
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">{vps.price}</TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">{vps.uptime}</TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1 min-w-[150px] justify-between">
            <div className="flex items-center gap-1">
              <CalendarClockIcon className="h-4 w-4 text-muted-foreground" />
              {formatDaysToExpiry(vps.daysToExpiry)}
            </div>
            {canRenew && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-2 py-0 text-xs"
                onClick={(e) => { e.stopPropagation(); setIsRenewDialogOpen(true); }}
                disabled={isRenewing}
              >
                {isRenewing ? <Loader2Icon className="h-3 w-3 animate-spin" /> : <RefreshCcwIcon className="h-3 w-3"/>}
                <span className="ml-1">Renew</span>
              </Button>
            )}
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm text-center whitespace-nowrap">{vps.load.toFixed(2)}</TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1">
            <ArrowDownIcon className="h-3 w-3 text-green-500" /> {vps.nicDown}
            <span className="text-muted-foreground mx-1">|</span>
            <ArrowUpIcon className="h-3 w-3 text-red-500" /> {vps.nicUp}
          </div>
        </TableCell>
        <TableCell className="p-2 text-sm whitespace-nowrap">
          <div className="flex items-center gap-1">
            <ArrowDownIcon className="h-3 w-3 text-green-500" /> {vps.network.currentMonthIn}
            <span className="text-muted-foreground mx-1">|</span>
            <ArrowUpIcon className="h-3 w-3 text-red-500" /> {vps.network.currentMonthOut}
          </div>
        </TableCell>
        <TableCell className="p-2 w-24 min-w-[96px]">
          <UsageBar percentage={vps.cpu.usage} />
        </TableCell>
        <TableCell className="p-2 w-24 min-w-[96px]">
          <UsageBar percentage={vps.ram.percentage} />
        </TableCell>
        <TableCell className="p-2 w-24 min-w-[96px]">
          <UsageBar percentage={vps.disk.percentage} />
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/5 hover:bg-muted/10">
          <TableCell colSpan={13} className="p-0">
            <div className="p-3 text-xs">
              <div className="space-y-1">
                <DetailItem label="Plan">
                  {vps.price}
                  {vps.billingCycle && vps.billingCycle !== 'N/A' ? ` (${vps.billingCycle})` : ''}
                  {vps.note_billing_end_date ? ` - Expires: ${formatBillingDate(vps.note_billing_end_date)}` : (vps.daysToExpiry !== 'N/A' ? ` - ${formatDaysToExpiry(vps.daysToExpiry)}` : '')}
                  {vps.planBandwidth && vps.planBandwidth !== 'N/A' ? ` - ${vps.planBandwidth}` : ''}
                  {vps.planTrafficType && vps.planTrafficType !== 'N/A' ? ` - ${vps.planTrafficType}` : ''}
                  {vps.ip_address ? ` - ${vps.ip_address}` : ''}
                </DetailItem>
                <DetailItem label="System">{vps.system}</DetailItem>
                <DetailItem label="CPU">
                  {vps.cpu.model} {vps.cpu.cores > 0 ? ` ${vps.cpu.cores} Virtual Core(s)` : ''} ({vps.cpu.usage.toFixed(2)}%)
                </DetailItem>
                <DetailItem label="Disk">
                  {vps.disk.used} / {vps.disk.total} ({vps.disk.percentage.toFixed(2)}%)
                </DetailItem>
                <DetailItem label="RAM">
                  {vps.ram.used} / {vps.ram.total} ({vps.ram.percentage.toFixed(2)}%)
                </DetailItem>
                {vps.swap.status === 'OFF' ? (
                  <DetailItem label="Swap">OFF</DetailItem>
                ) : (
                  <DetailItem label="Swap">
                    {vps.swap.used || '0 MB'} / {vps.swap.total || '0 MB'} 
                    {vps.swap.percentage !== undefined ? ` (${vps.swap.percentage.toFixed(2)}%)` : ''}
                  </DetailItem>
                )}
                <DetailItem label="Usage (Total)">
                  IN {vps.network.totalIn} / OUT {vps.network.totalOut}
                </DetailItem>
                <DetailItem label="Load Avg">
                  {vps.loadAverage.map(l => l.toFixed(2)).join(' / ')}
                </DetailItem>
                <DetailItem label="Processes">{vps.processCount}</DetailItem>
                <DetailItem label="Connections">
                  TCP {vps.connections.tcp} / UDP {vps.connections.udp}
                </DetailItem>
                <DetailItem label="Boot Time">{formatFullDate(vps.bootTime)}</DetailItem>
                <DetailItem label="Last Active">{formatFullDate(vps.lastActive)}</DetailItem>
                <DetailItem label="Uptime">{vps.uptime}</DetailItem>
                <DetailItem label="Agent Ver">{vps.agentVersion || 'N/A'}</DetailItem>
              </div>
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRenewing}>Cancel</AlertDialogCancel>
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
    <TableRow>
      {[...Array(13)].map((_, i) => (
        <TableCell key={i} className="p-2">
          <div className="h-5 bg-muted rounded animate-pulse" style={{ width: i === 1 ? '120px' : i === 6 ? '130px' : i > 9 ? '80px' : '60px' }} />
        </TableCell>
      ))}
    </TableRow>
  );
}
