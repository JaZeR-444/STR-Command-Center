'use client';

import { cn, getTimingStyles, getStatusStyles } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'timing' | 'status';
  timing?: string;
  status?: string;
  className?: string;
}

export function Badge({ children, variant = 'default', timing, status, className }: BadgeProps) {
  let styles = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  
  if (variant === 'timing' && timing) {
    styles = getTimingStyles(timing);
  } else if (variant === 'status' && status) {
    styles = getStatusStyles(status);
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border',
        styles,
        className
      )}
    >
      {children}
    </span>
  );
}
