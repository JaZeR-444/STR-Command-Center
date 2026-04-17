'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const getBarColor = () => {
    if (percentage >= 100) return 'bg-gradient-to-r from-success-400 via-success-300 to-emerald-400';
    if (percentage >= 75) return 'bg-gradient-to-r from-success-400 to-success-300';
    if (percentage >= 50) return 'bg-gradient-to-r from-warm-400 to-warm-300';
    if (percentage >= 25) return 'bg-gradient-to-r from-accent-400 to-accent-300';
    return 'bg-gradient-to-r from-slate-400 to-slate-300';
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-2 text-sm text-slate-300">
          <span className="font-medium">Progress</span>
          <span className="font-bold">{percentage}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden border border-white/[0.15] bg-white/[0.06]',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-700 ease-out',
            getBarColor(),
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
