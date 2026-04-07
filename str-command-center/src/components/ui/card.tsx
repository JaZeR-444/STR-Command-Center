'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'brutal';
}

export function Card({ children, className, hover = false, onClick, variant = 'default' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.5rem] border transition-all duration-300',
        variant === 'glass' && 'glass shadow-medium',
        variant === 'brutal' && 'card-brutal bg-zinc-900',
        variant === 'default' && 'glass border-white/10 shadow-soft',
        hover && 'hover:-translate-y-0.5 hover:border-white/15 hover:shadow-medium cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-6 py-5 border-b border-white/10', className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-[1.45rem] font-display font-semibold text-white tracking-tight', className)}>
      {children}
    </h3>
  );
}
