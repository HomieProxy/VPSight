
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
  ActivityIcon,
  InfoIcon,
  NetworkIcon,
  ListTreeIcon,
  ClockIcon,
  HardDriveIcon,
  MemoryStickIcon,
  CpuIcon as CpuDetailIcon, // Renamed to avoid conflict with CpuIcon in MetricDisplay
  TagIcon,
  DollarSignIcon,
  ShieldQuestionIcon,
  MapPinIcon
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricDisplay } from './MetricDisplay';

interface VpsTableRowProps {
  vps: VpsData;
}

export function VpsTableRow({ vps }: VpsTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDaysToExpiry = (days: number | string) => {
    if (typeof days === 'string') return days; // "N/A" or "Expired"
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    return `${days}d`;
  };
  
  const safeParseDate = (dateString: string | undefined | null) => {
    if (!dateString) return null;
    try {
      return parseISO(dateString);
    } catch (e) {
      return null;
    }
  };

  const bootTimeDate = safeParseDate(vps.bootTime);
  const lastActiveDate = safeParseDate(vps.lastActive);
  
  const bootTimeAgo = bootTimeDate ? formatDistanceToNow(bootTimeDate, { addSuffix: true }) : 'N/A';
  const lastActiveAgo = lastActiveDate ? formatDistanceToNow(lastActiveDate, { addSuffix: true }) : 'N/A';

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
              <ComputerIcon className="h-4 w-4 text-muted-foreground" />
            }
            {vps.system !== 'Unknown OS' && vps.system}
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
        <TableRow className="bg-muted/10">
          <TableCell colSpan={13} className="p-0">
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><InfoIcon className="mr-2 h-5 w-5 text-primary" />General Info</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <MetricDisplay icon={<TagIcon />} label="Hostname" value={vps.name} />
                  <MetricDisplay icon={<ComputerIcon />} label="System OS" value={vps.system} />
                  <MetricDisplay icon={<MapPinIcon />} label="IP Address" value={vps.ip_address || 'N/A'} />
                  <MetricDisplay icon={<ShieldQuestionIcon />} label="Agent Version" value={vps.agentVersion || 'N/A'} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><DollarSignIcon className="mr-2 h-5 w-5 text-primary" />Billing & Plan</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <MetricDisplay icon={<DollarSignIcon />} label="Price" value={vps.price} />
                  <MetricDisplay icon={<CalendarClockIcon />} label="Remaining" value={formatDaysToExpiry(vps.daysToExpiry)} />
                  <MetricDisplay icon={<InfoIcon />} label="Billing Cycle" value={vps.billingCycle || 'N/A'} />
                  <MetricDisplay icon={<NetworkIcon />} label="Plan Bandwidth" value={vps.planBandwidth || 'N/A'} />
                  <MetricDisplay icon={<InfoIcon />} label="Traffic Type" value={vps.planTrafficType || 'N/A'} />
                </CardContent>
              </Card>
               <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><CpuDetailIcon className="mr-2 h-5 w-5 text-primary" />Hardware</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <MetricDisplay icon={<CpuDetailIcon />} label="CPU Model" value={vps.cpu.model} />
                  <MetricDisplay icon={<CpuDetailIcon />} label="CPU Cores" value={vps.cpu.cores.toString()} />
                  <MetricDisplay icon={<MemoryStickIcon />} label="Total RAM" value={vps.ram.total} />
                  <MetricDisplay icon={<HardDriveIcon />} label="Total Disk" value={vps.disk.total} />
                  <MetricDisplay icon={<HardDriveIcon />} label="Swap Status" value={vps.swap.status} />
                 </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><NetworkIcon className="mr-2 h-5 w-5 text-primary" />Total Network</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <MetricDisplay icon={<ArrowDownIcon className="text-green-500"/>} label="Total IN" value={vps.network.totalIn} />
                  <MetricDisplay icon={<ArrowUpIcon className="text-red-500"/>} label="Total OUT" value={vps.network.totalOut} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><ActivityIcon className="mr-2 h-5 w-5 text-primary" />System Activity</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <MetricDisplay icon={<ActivityIcon />} label="Load Avg (1/5/15m)" value={vps.loadAverage.map(l => l.toFixed(2)).join(' / ')} />
                  <MetricDisplay icon={<ListTreeIcon />} label="Processes" value={vps.processCount.toString()} />
                  <MetricDisplay icon={<NetworkIcon />} label="Connections" value={`TCP: ${vps.connections.tcp} / UDP: ${vps.connections.udp}`} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><ClockIcon className="mr-2 h-5 w-5 text-primary" />Timestamps</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <MetricDisplay 
                    icon={<ClockIcon />} 
                    label="Boot Time" 
                    value={bootTimeDate ? bootTimeDate.toLocaleString() : 'N/A'}
                    unit={bootTimeDate ? `(${bootTimeAgo})` : ''} 
                  />
                  <MetricDisplay 
                    icon={<ClockIcon />} 
                    label="Last Active" 
                    value={lastActiveDate ? lastActiveDate.toLocaleString() : 'N/A'}
                    unit={lastActiveDate ? `(${lastActiveAgo})` : ''}
                  />
                </CardContent>
              </Card>
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
