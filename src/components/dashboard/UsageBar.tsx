
import { cn } from '@/lib/utils';

interface UsageBarProps {
  percentage: number;
  className?: string;
  barClassName?: string;
  showText?: boolean; // New prop
}

export function UsageBar({
  percentage,
  className,
  barClassName,
  showText = true, // Default to true
}: UsageBarProps) {
  const displayPercentage = Math.max(0, Math.min(100, percentage));

  let bgColor = 'bg-green-500'; 
  if (displayPercentage === 0 && percentage < 0) { // Special case for expired or N/A if used for "Remaining"
    bgColor = 'bg-muted';
  } else if (displayPercentage <= 25) { // Example: ~7 days out of 30
    bgColor = 'bg-red-500';
  } else if (displayPercentage <= 50) { // Example: ~15 days out of 30
    bgColor = 'bg-orange-500';
  }
  
  const textColor = displayPercentage > 50 && (bgColor === 'bg-red-500' || bgColor === 'bg-orange-500' || bgColor === 'bg-green-500') ? 'text-white' : 'text-foreground';

  return (
    <div className={cn("w-full h-5 rounded-sm bg-muted/50 relative overflow-hidden my-0.5", className)}>
      <div
        className={cn("h-full rounded-sm transition-all duration-300 ease-in-out", bgColor, barClassName)}
        style={{ width: `${displayPercentage}%` }}
      />
      {showText && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center text-xs font-medium",
          textColor
          )}
        >
          {displayPercentage.toFixed(1)}%
        </div>
      )}
    </div>
  );
}
