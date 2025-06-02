import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MetricDisplay } from './MetricDisplay';
import type { VpsData } from '@/types/vps-data';
import { GaugeIcon, HardDriveIcon, MemoryStickIcon, LayersIcon } from 'lucide-react';

interface ResourceUsageCardProps {
  data: VpsData;
}

export function ResourceUsageCard({ data }: ResourceUsageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-xl">
          <GaugeIcon className="mr-2 h-6 w-6 text-primary" /> Resource Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <MetricDisplay
            icon={<CpuIcon />}
            label="CPU Usage"
            value={`${data.cpu.usage.toFixed(2)}%`}
            valueClassName="text-accent"
          />
          <Progress value={data.cpu.usage} className="mt-1 h-3" indicatorClassName="bg-accent" />
        </div>
        <div>
          <MetricDisplay
            icon={<MemoryStickIcon />}
            label="RAM Usage"
            value={`${data.ram.used} / ${data.ram.total} (${data.ram.percentage.toFixed(2)}%)`}
          />
          <Progress value={data.ram.percentage} className="mt-1 h-3" />
        </div>
        <div>
          <MetricDisplay
            icon={<HardDriveIcon />}
            label="Disk Usage"
            value={`${data.disk.used} / ${data.disk.total} (${data.disk.percentage.toFixed(2)}%)`}
          />
          <Progress value={data.disk.percentage} className="mt-1 h-3" />
        </div>
        <div>
          <MetricDisplay
            icon={<LayersIcon />}
            label="Swap Usage"
            value={data.swap.status}
          />
          {data.swap.status !== 'OFF' && data.swap.percentage !== undefined && (
             <Progress value={data.swap.percentage} className="mt-1 h-3" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
