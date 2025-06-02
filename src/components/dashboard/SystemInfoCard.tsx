import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricDisplay } from './MetricDisplay';
import type { VpsData } from '@/types/vps-data';
import { ServerIcon, CpuIcon, CalendarDaysIcon, ActivityIcon } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface SystemInfoCardProps {
  data: VpsData;
}

export function SystemInfoCard({ data }: SystemInfoCardProps) {
  const bootTimeAgo = data.bootTime ? formatDistanceToNow(parseISO(data.bootTime), { addSuffix: true }) : 'N/A';
  const lastActiveAgo = data.lastActive ? formatDistanceToNow(parseISO(data.lastActive), { addSuffix: true }) : 'N/A';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-xl">
          <ServerIcon className="mr-2 h-6 w-6 text-primary" /> System Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetricDisplay label="Hostname" value={data.name} />
        <MetricDisplay label="System" value={data.system} />
        <MetricDisplay label="CPU Model" value={data.cpu.model} />
        <MetricDisplay 
            label="Boot Time" 
            value={data.bootTime ? new Date(data.bootTime).toLocaleString() : 'N/A'} 
            unit={`(${bootTimeAgo})`} 
            icon={<CalendarDaysIcon />}
        />
        <MetricDisplay 
            label="Last Active" 
            value={data.lastActive ? new Date(data.lastActive).toLocaleString() : 'N/A'} 
            unit={`(${lastActiveAgo})`} 
            icon={<ActivityIcon />}
        />
      </CardContent>
    </Card>
  );
}
