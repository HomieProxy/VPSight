import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricDisplay } from './MetricDisplay';
import type { VpsData } from '@/types/vps-data';
import { ActivitySquareIcon, ListTreeIcon } from 'lucide-react';

interface SystemLoadCardProps {
  data: VpsData;
}

export function SystemLoadCard({ data }: SystemLoadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-xl">
          <ActivitySquareIcon className="mr-2 h-6 w-6 text-primary" /> System Load
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetricDisplay
          icon={<ActivitySquareIcon />}
          label="Load Average (1m, 5m, 15m)"
          value={data.loadAverage.join(' / ')}
        />
        <MetricDisplay
          icon={<ListTreeIcon />}
          label="Process Count"
          value={data.processCount}
        />
      </CardContent>
    </Card>
  );
}
