
import type { VpsData } from '@/types/vps-data';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: VpsData['status'];
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      <span
        className={cn(
          'h-3 w-3 rounded-full',
          status === 'online' && 'bg-green-500',
          status === 'offline' && 'bg-slate-500',
          status === 'error' && 'bg-red-500'
        )}
        title={status.charAt(0).toUpperCase() + status.slice(1)}
      />
    </div>
  );
}
