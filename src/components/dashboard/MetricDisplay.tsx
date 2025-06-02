import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface MetricDisplayProps {
  icon?: React.ReactElement<LucideProps>;
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}

export function MetricDisplay({
  icon,
  label,
  value,
  unit,
  className,
  valueClassName,
  labelClassName,
}: MetricDisplayProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {icon && React.cloneElement(icon, { className: cn('h-5 w-5 text-muted-foreground', icon.props.className) })}
      <div className="flex-1">
        <p className={cn('text-sm text-muted-foreground', labelClassName)}>{label}</p>
        <p className={cn('text-lg font-medium text-foreground', valueClassName)}>
          {value}
          {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
