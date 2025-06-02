
'use client';
import React, { useState } from 'react';
import type { VpsData } from '@/types/vps-data';
import { TableCell, TableRow } from '@/components/ui/table';
import { StatusIndicator } from './StatusIndicator';
import { UsageBar } from './UsageBar';
import { 
  ComputerIcon, 
  GlobeIcon, 
  ArrowDownIcon, 
  ArrowUpIcon, 
  CalendarClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ServerOffIcon,
} from 'lucide-react';
import { formatDistanceToNow, parseISO, format, isValid } from 'date-fns';

interface VpsTableRowProps {
  vps: VpsData;
}

// Helper function to format full date for display
const formatFullDate = (isoString: string | null | undefined): string => {
  if (!isoString) return 'N/A';
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return 'N/A';
    return format(date, 'M/d/yyyy, h:mm:ss a'); // Example: 1/15/2025, 4:07:36 PM
  } catch (e) {
    console.error("Error formatting date:", isoString, e);
    return 'Invalid Date';
  }
};

// Helper function to format expiry date
const formatExpiryDate = (isoString: string | null | undefined): string => {
  if (!isoString) return 'N/A';
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return 'N/A';
    return format(date, 'yyyy-MM-dd');
  } catch (e) {
    return 'Invalid Date';
  }
};


export function VpsTableRow({ vps }: VpsTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDaysToExpiry = (days: number | string) => {
    if (typeof days === 'string') return days; // "N/A" or "Expired"
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
              <> <ComputerIcon className="h-4 w-4 text-muted-foreground" /> {vps.system} </>
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
          <div className="flex items-center gap-1">
            <CalendarClockIcon className="h-4 w-4 text-muted-foreground" />
            {formatDaysToExpiry(vps.daysToExpiry)}
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
                  {vps.note_billing_end_date ? ` - Expires: ${formatExpiryDate(vps.note_billing_end_date)}` : (vps.daysToExpiry !== 'N/A' ? ` - ${formatDaysToExpiry(vps.daysToExpiry)}` : '')}
                  {vps.planBandwidth && vps.planBandwidth !== 'N/A' ? ` - ${vps.planBandwidth}` : ''}
                  {vps.ip_address ? ` - ${vps.ip_address}` : ''}
                </DetailItem>
                <DetailItem label="System">{vps.system}</DetailItem>
                <DetailItem label="CPU">
                  {vps.cpu.model} {vps.cpu.cores > 0 ? `${vps.cpu.cores} Core(s)` : ''} ({vps.cpu.usage.toFixed(2)}%)
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
    </>
  );
}

export function VpsTableSkeletonRow() {
  return (
    <TableRow>
      {[...Array(13)].map((_, i) => (
        <TableCell key={i} className="p-2">
          <div className="h-5 bg-muted rounded animate-pulse" style={{ width: i === 1 ? '120px' : i > 9 ? '80px' : '60px' }} />
        </TableCell>
      ))}
    </TableRow>
  );
}
