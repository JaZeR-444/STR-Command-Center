import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-zinc-800/50',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card-dark border border-border-dark rounded-xl p-6">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function TaskListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-card-dark border border-border-dark rounded-lg">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
