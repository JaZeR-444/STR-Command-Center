'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TaskQuickActionsProps {
  taskId: number;
  isCompleted: boolean;
  isPinned: boolean;
  isBlocked: boolean;
  hasNote: boolean;
  onToggleComplete: () => void;
  onTogglePin: () => void;
  onToggleBlocked: () => void;
  onAddNote: () => void;
  className?: string;
}

export function TaskQuickActions({
  taskId,
  isCompleted,
  isPinned,
  isBlocked,
  hasNote,
  onToggleComplete,
  onTogglePin,
  onToggleBlocked,
  onAddNote,
  className,
}: TaskQuickActionsProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const actions = [
    {
      id: 'complete',
      label: isCompleted ? 'Uncomplete' : 'Complete',
      icon: isCompleted ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      onClick: onToggleComplete,
      active: isCompleted,
      color: 'text-emerald-400 hover:bg-emerald-500/20',
      shortcut: 'Space',
    },
    {
      id: 'pin',
      label: isPinned ? 'Unpin' : 'Pin',
      icon: (
        <svg className="w-4 h-4" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      onClick: onTogglePin,
      active: isPinned,
      color: 'text-blue-400 hover:bg-blue-500/20',
      shortcut: 'P',
    },
    {
      id: 'blocked',
      label: isBlocked ? 'Unblock' : 'Mark Blocked',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      onClick: onToggleBlocked,
      active: isBlocked,
      color: 'text-red-400 hover:bg-red-500/20',
      shortcut: 'B',
    },
    {
      id: 'note',
      label: hasNote ? 'Edit Note' : 'Add Note',
      icon: (
        <svg className="w-4 h-4" fill={hasNote ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      onClick: onAddNote,
      active: hasNote,
      color: 'text-amber-400 hover:bg-amber-500/20',
      shortcut: 'N',
    },
  ];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {actions.map((action) => (
        <div key={action.id} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            onMouseEnter={() => setShowTooltip(action.id)}
            onMouseLeave={() => setShowTooltip(null)}
            className={cn(
              'p-2 rounded-lg border border-transparent transition-all duration-150',
              action.active ? action.color : 'text-zinc-500 hover:text-zinc-300',
              action.color
            )}
            title={action.label}
          >
            {action.icon}
          </button>
          
          {/* Tooltip */}
          {showTooltip === action.id && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs whitespace-nowrap z-50 shadow-lg">
              {action.label}
              <span className="ml-2 text-zinc-500 font-mono text-[10px]">{action.shortcut}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
