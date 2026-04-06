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
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getBarColor = () => {
    if (percentage >= 100) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (percentage >= 75) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (percentage >= 50) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    if (percentage >= 25) return 'bg-gradient-to-r from-orange-500 to-orange-400';
    return 'bg-gradient-to-r from-indigo-500 to-purple-500';
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs text-slate-400">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-bg-surface rounded-full overflow-hidden border border-border-dark',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            getBarColor(),
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
