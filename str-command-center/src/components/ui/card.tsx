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
        'rounded-2xl border transition-all duration-300',
        variant === 'glass' && 'glass shadow-medium',
        variant === 'brutal' && 'card-brutal bg-[#2a2435]',
        variant === 'default' && 'glass border-white/[0.15] shadow-soft',
        hover && 'hover:-translate-y-1 hover:border-white/[0.22] hover:shadow-medium cursor-pointer',
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
    <div className={cn('px-6 py-5 border-b border-white/[0.12]', className)}>
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
    <h3 className={cn('text-2xl font-display font-bold text-white tracking-tight', className)}>
      {children}
    </h3>
  );
}
