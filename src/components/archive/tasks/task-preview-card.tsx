'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn, getProgressColor } from '@/lib/utils';
import type { Task, TaskMeta } from '@/types';

interface TaskPreviewCardProps {
  task: Task;
  meta?: TaskMeta;
  isCompleted: boolean;
  isPinned: boolean;
  bucket?: 'plan' | 'setup' | 'manage' | 'custom';
  onToggleComplete: () => void;
  onTogglePin: () => void;
  onToggleBlocked: () => void;
  onClick: () => void;
}

export function TaskPreviewCard({
  task,
  meta,
  isCompleted,
  isPinned,
  bucket,
  onToggleComplete,
  onTogglePin,
  onToggleBlocked,
  onClick,
}: TaskPreviewCardProps) {
  const status = meta?.status || 'default';
  const checklistItems = meta?.checklistItems || [];
  const linkedDocsCount = (meta?.linkedDocuments?.length || 0) + (meta?.attachedFiles?.length || 0);
  const isVerified = meta?.isVerifiedComplete || false;

  // Calculate checklist progress
  const completedChecklist = checklistItems.filter(item => item.completed).length;
  const totalChecklist = checklistItems.length;
  const hasChecklist = totalChecklist > 0;

  return (
    <div
      className={cn(
        'group relative rounded-xl border-2 transition-all duration-200 cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5',
        status === 'blocked' && 'bg-red-500/5 border-red-500/30 hover:border-red-500/50',
        status === 'in-progress' && 'bg-blue-500/5 border-blue-500/30 hover:border-blue-500/50',
        status === 'default' && !isCompleted && 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700',
        isCompleted && 'bg-zinc-900/20 border-zinc-800/50 opacity-75'
      )}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Top Row: Checkbox + Title */}
        <div className="flex items-start gap-3 mb-2">
          <div
            className="mt-0.5 shrink-0"
            onClick={e => {
              e.stopPropagation();
              onToggleComplete();
            }}
          >
            <Checkbox
              checked={isCompleted}
              onChange={onToggleComplete}
              className={isVerified ? 'border-emerald-500 bg-emerald-500/20' : ''}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                'text-sm font-semibold leading-snug',
                isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-100'
              )}
            >
              {task.task}
              {isVerified && (
                <span className="ml-2 text-emerald-400 text-xs">✅</span>
              )}
            </h4>
          </div>

          {/* Quick action icons (visible on hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex gap-1">
            <button
              onClick={e => {
                e.stopPropagation();
                onTogglePin();
              }}
              className={cn(
                'p-1 rounded hover:bg-zinc-800 transition-colors',
                isPinned ? 'text-amber-400' : 'text-zinc-600'
              )}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 3a1 1 0 011 1v1l-2 4 1 1h3a1 1 0 010 2h-1l-1 1-1 5H8l-1-5-1-1H5a1 1 0 010-2h3l1-1-2-4V4a1 1 0 011-1h8zm-4 13a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleBlocked();
              }}
              className={cn(
                'p-1 rounded hover:bg-zinc-800 transition-colors',
                status === 'blocked' ? 'text-red-400' : 'text-zinc-600'
              )}
              title={status === 'blocked' ? 'Unblock' : 'Mark blocked'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description snippet */}
        {task.description && (
          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-3 ml-9">
            {task.description}
          </p>
        )}

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap mb-3 ml-9">
          {bucket && (
            <Badge
              variant="default"
              className={cn(
                'text-[10px]',
                bucket === 'plan' && 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                bucket === 'setup' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                bucket === 'manage' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                bucket === 'custom' && 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
              )}
            >
              {bucket === 'plan' ? 'Plan' : bucket === 'setup' ? 'Set Up' : bucket === 'manage' ? 'Manage' : 'Other'}
            </Badge>
          )}
          <Badge variant="timing" timing={task.timing} className="text-[10px]">
            {task.timing}
          </Badge>
          {status !== 'default' && (
            <Badge variant="status" status={status} className="text-[10px]">
              {status === 'in-progress' ? 'Active' : status === 'blocked' ? 'Blocked' : 'N/A'}
            </Badge>
          )}
          {isPinned && <span className="text-amber-400 text-xs">📌</span>}
        </div>

        {/* Bottom row: Progress indicators */}
        <div className="flex items-center justify-between text-xs text-zinc-600 ml-9">
          <div className="flex items-center gap-3">
            {/* Checklist progress */}
            {hasChecklist && (
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(totalChecklist, 5) }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-colors',
                        i < completedChecklist ? 'bg-emerald-500' : 'bg-zinc-700'
                      )}
                    />
                  ))}
                </div>
                <span className={cn(completedChecklist === totalChecklist && totalChecklist > 0 ? 'text-emerald-400 font-semibold' : '')}>
                  {completedChecklist}/{totalChecklist}
                </span>
              </div>
            )}

            {/* Documents count */}
            {linkedDocsCount > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>{linkedDocsCount}</span>
              </div>
            )}
          </div>

          {/* Arrow indicator */}
          <svg className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
