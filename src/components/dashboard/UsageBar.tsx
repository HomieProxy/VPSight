
import { cn } from '@/lib/utils';

interface UsageBarProps {
  percentage: number;
  className?: string;
  barClassName?: string;
}

export function UsageBar({ percentage, className, barClassName }: UsageBarProps) {
  const displayPercentage = Math.max(0, Math.min(100, percentage));

  let bgColor = 'bg-green-500'; // Default to primary or accent color from theme
  if (displayPercentage > 85) {
    bgColor = 'bg-red-500';
  } else if (displayPercentage > 60) {
    bgColor = 'bg-orange-500';
  }
  
  // Text color based on background for better contrast
  const textColor = displayPercentage > 50 && (bgColor === 'bg-red-500' || bgColor === 'bg-orange-500' || bgColor === 'bg-green-500') ? 'text-white' : 'text-foreground';


  return (
    <div className={cn("w-full h-5 rounded-sm bg-muted/50 relative overflow-hidden my-0.5", className)}>
      <div
        className={cn("h-full rounded-sm transition-all duration-300 ease-in-out", bgColor, barClassName)}
        style={{ width: `${displayPercentage}%` }}
      />
      <div className={cn(
        "absolute inset-0 flex items-center justify-center text-xs font-medium",
         textColor
        )}
      >
        {displayPercentage.toFixed(1)}%
      </div>
    </div>
  );
}
