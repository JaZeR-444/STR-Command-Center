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
    if (percentage >= 100) return 'bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-300';
    if (percentage >= 75) return 'bg-gradient-to-r from-emerald-400 to-cyan-300';
    if (percentage >= 50) return 'bg-gradient-to-r from-amber-300 to-yellow-200';
    if (percentage >= 25) return 'bg-gradient-to-r from-[#9bc2ff] to-[#6f93c5]';
    return 'bg-gradient-to-r from-[#657991] to-[#89a8cd]';
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
          'w-full rounded-full overflow-hidden border border-white/10 bg-white/[0.04]',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-700 ease-out shadow-[0_0_18px_rgba(138,180,255,0.18)]',
            getBarColor(),
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
