
import type { VpsData } from '@/types/vps-data';
import { TableCell, TableRow } from '@/components/ui/table';
import { StatusIndicator } from './StatusIndicator';
import { UsageBar } from './UsageBar';
import { ComputerIcon, GlobeIcon, ArrowDownIcon, ArrowUpIcon, CalendarClockIcon } from 'lucide-react';

interface VpsTableRowProps {
  vps: VpsData;
}

export function VpsTableRow({ vps }: VpsTableRowProps) {
  const formatDaysToExpiry = (days: number | string) => {
    if (typeof days === 'string') return days; // "N/A" or "Expired"
    if (days < 0) return 'Expired'; // Should be handled by API but as a fallback
    if (days === 0) return 'Today';
    return `${days}d`;
  };

  return (
    <TableRow className="hover:bg-muted/20">
      <TableCell className="p-2 text-center w-16">
        <StatusIndicator status={vps.status} />
      </TableCell>
      <TableCell className="p-2 font-medium text-sm whitespace-nowrap">{vps.name}</TableCell>
      <TableCell className="p-2 text-sm whitespace-nowrap">
        <div className="flex items-center gap-1">
          <ComputerIcon className="h-4 w-4 text-muted-foreground" />
          {vps.system}
        </div>
      </TableCell>
      <TableCell className="p-2 text-sm whitespace-nowrap">
        <div className="flex items-center gap-1">
          <GlobeIcon className="h-4 w-4 text-muted-foreground" />
          {vps.countryRegion}
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
  );
}

export function VpsTableSkeletonRow() {
  return (
    <TableRow>
      {[...Array(13)].map((_, i) => ( // Increased count for new column
        <TableCell key={i} className="p-2">
          <div className="h-5 bg-muted rounded animate-pulse" style={{ width: i === 1 ? '120px' : i > 9 ? '80px' : '60px' }} />
        </TableCell>
      ))}
    </TableRow>
  );
}
