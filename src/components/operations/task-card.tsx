'use client';

import { properties } from '@/data/properties';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OperationsTask } from '@/types';

const priorityColors = {
  p0: 'bg-red-500/10 text-red-400 border-red-500/20',
  p1: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  p2: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  p3: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const priorityLabels = {
  p0: 'Urgent',
  p1: 'High',
  p2: 'Medium',
  p3: 'Low',
};

const typeIcons = {
  cleaning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
    </svg>
  ),
  maintenance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  ),
  inspection: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
    </svg>
  ),
};

export function TaskCard({
  task,
  onClick,
}: {
  task: OperationsTask;
  onClick: () => void;
}) {
  const property = properties.find(p => p.id === task.propertyId);
  const scheduledDate = new Date(task.scheduledDate);
  const isToday = scheduledDate.toDateString() === new Date().toDateString();
  const completedProgress = task.checklist
    ? `${task.checklist.filter(Boolean).length}/${task.checklist.length}`
    : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl border-2 transition-all hover:border-zinc-600 hover:bg-zinc-900/50',
        task.status === 'queued' && 'bg-zinc-900/30 border-zinc-800',
        task.status === 'in_progress' && 'bg-blue-500/5 border-blue-500/30',
        task.status === 'completed' && 'bg-emerald-500/5 border-emerald-500/30 opacity-60',
        task.status === 'cancelled' && 'bg-zinc-900/20 border-zinc-800/50 opacity-40'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-2 rounded-lg',
            task.type === 'cleaning' && 'bg-blue-500/10 text-blue-400',
            task.type === 'maintenance' && 'bg-amber-500/10 text-amber-400',
            task.type === 'inspection' && 'bg-purple-500/10 text-purple-400'
          )}>
            {typeIcons[task.type]}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{task.title}</h3>
            {property && (
              <p className="text-xs text-zinc-500 mt-0.5">{property.name}</p>
            )}
          </div>
        </div>
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-medium border',
          priorityColors[task.priority]
        )}>
          {priorityLabels[task.priority]}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Schedule */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <span className={cn(
            'font-medium',
            isToday ? 'text-emerald-400' : 'text-zinc-400'
          )}>
            {scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {isToday && ' (Today)'}
          </span>
        </div>
        {task.scheduledTimeStart && (
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span className="text-zinc-400">
              {task.scheduledTimeStart}
              {task.scheduledTimeEnd && ` - ${task.scheduledTimeEnd}`}
            </span>
          </div>
        )}
      </div>

      {/* Assignee */}
      {task.assigneeName && (
        <div className="flex items-center gap-1.5 mb-3 text-xs">
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span className="text-zinc-400">{task.assigneeName}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          {task.status === 'completed' && task.completedAt && (
            <span className="text-xs text-emerald-400 font-medium">
              ✓ Completed
            </span>
          )}
          {task.status === 'in_progress' && (
            <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              In Progress
            </span>
          )}
          {task.status === 'queued' && (
            <span className="text-xs text-zinc-500">
              Queued
            </span>
          )}
        </div>
        {completedProgress && task.status !== 'completed' && (
          <span className="text-xs text-zinc-500">
            {completedProgress} tasks
          </span>
        )}
      </div>

      {/* Notes indicator */}
      {task.notes && (
        <div className="mt-2 text-xs text-zinc-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
          </svg>
          Has notes
        </div>
      )}
    </button>
  );
}
