import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricDisplay } from './MetricDisplay';
import type { VpsData } from '@/types/vps-data';
import { ArrowDownUpIcon, WifiIcon, UsersIcon } from 'lucide-react';

interface NetworkDataCardProps {
  data: VpsData;
}

export function NetworkDataCard({ data }: NetworkDataCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-headline text-xl">
          <WifiIcon className="mr-2 h-6 w-6 text-primary" /> Network Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetricDisplay
          icon={<ArrowDownUpIcon className="text-green-500" />}
          label="Total IN"
          value={data.network.totalIn}
        />
        <MetricDisplay
          icon={<ArrowDownUpIcon className="text-red-500" />}
          label="Total OUT"
          value={data.network.totalOut}
        />
        <MetricDisplay
          icon={<ArrowDownUpIcon className="text-green-500" />}
          label="Current Month IN"
          value={data.network.currentMonthIn}
          valueClassName="text-accent"
        />
        <MetricDisplay
          icon={<ArrowDownUpIcon className="text-red-500" />}
          label="Current Month OUT"
          value={data.network.currentMonthOut}
          valueClassName="text-accent"
        />
         <MetricDisplay
          icon={<UsersIcon />}
          label="Connections"
          value={`TCP: ${data.connections.tcp} / UDP: ${data.connections.udp}`}
        />
      </CardContent>
    </Card>
  );
}
