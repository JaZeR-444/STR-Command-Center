'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { AppState, Task } from '@/types';
import { allTasks } from '@/data/roadmap';
import { getBlockedTasks, getInProgressTasks } from '@/lib/selectors';

interface ActionItem {
  id: number;
  task: Task;
  priority: number;
  reason: string;
  type: 'blocked' | 'critical' | 'in-progress';
  dependentCount?: number;
}

/**
 * ML-style prioritization algorithm
 * Scores tasks based on:
 * - Blocked tasks get highest priority
 * - Number of tasks depending on this one
 * - Time since marked in-progress
 * - Pre-Listing tasks get bonus near launch date
 */
function calculatePriority(
  task: Task,
  state: AppState,
  blockedTasks: Task[],
  inProgressTasks: Task[],
  daysUntilLaunch: number
): ActionItem | null {
  // Skip completed tasks
  if (state.completedIds.includes(task.id)) return null;

  const meta = state.taskMeta[task.id];
  let priority = 0;
  let type: ActionItem['type'] = 'critical';
  let reason = '';
  let dependentCount = 0;

  // BLOCKED TASKS: Highest priority
  if (meta?.status === 'blocked') {
    priority = 1000;
    type = 'blocked';
    
    // Count how many other tasks are blocked by this
    const taskIds = allTasks.map(t => t.id);
    dependentCount = taskIds.filter(id => {
      const otherMeta = state.taskMeta[id];
      return otherMeta?.status === 'blocked' && id !== task.id;
    }).length;
    
    reason = dependentCount > 0 
      ? `Blocking ${dependentCount} other task${dependentCount > 1 ? 's' : ''}`
      : 'Blocked - needs immediate attention';
    
    priority += dependentCount * 100;
  }
  // IN-PROGRESS: Medium-high priority (keep momentum)
  else if (meta?.status === 'in-progress') {
    priority = 500;
    type = 'in-progress';
    
    if (meta.completedAt) {
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(meta.completedAt).getTime()) / 86400000
      );
      priority += daysSinceStart * 10; // Older in-progress = higher priority
      reason = daysSinceStart > 1 
        ? `In progress for ${daysSinceStart} days` 
        : 'In progress';
    } else {
      reason = 'In progress';
    }
  }
  // PRE-LISTING CRITICAL: High priority if launch is soon
  else if (task.timing === 'Pre-Listing' && daysUntilLaunch <= 14) {
    priority = 300;
    type = 'critical';
    reason = `Required for launch (${daysUntilLaunch} days left)`;
    
    if (daysUntilLaunch <= 7) {
      priority += 200; // Extra urgency if < 1 week
    }
  }
  // PINNED: User explicitly wants to focus on this
  else if (state.pinnedIds.includes(task.id)) {
    priority = 250;
    type = 'critical';
    reason = 'Pinned for focus';
  }
  else {
    return null; // Don't include in top actions
  }

  return {
    id: task.id,
    task,
    priority,
    reason,
    type,
    dependentCount,
  };
}

interface CommandStationProps {
  state: AppState;
  daysUntilLaunch: number;
}

export function CommandStation({ state, daysUntilLaunch }: CommandStationProps) {
  const topActions = useMemo(() => {
    const blockedTasks = getBlockedTasks(state);
    const inProgressTasks = getInProgressTasks(state);
    
    const scoredActions: ActionItem[] = [];
    
    for (const task of allTasks) {
      const action = calculatePriority(task, state, blockedTasks, inProgressTasks, daysUntilLaunch);
      if (action) {
        scoredActions.push(action);
      }
    }
    
    // Sort by priority (highest first) and take top 3
    return scoredActions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  }, [state, daysUntilLaunch]);

  if (topActions.length === 0) {
    return (
      <div className="glass shimmer-border rounded-[2rem] p-8 text-center border border-white/10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl premium-pill text-[#f1d39a]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-3xl font-display font-semibold text-white mb-2">Operations are on track</h3>
        <p className="text-zinc-400 text-sm">No urgent actions are outstanding right now.</p>
      </div>
    );
  }

  return (
    <div className="glass shimmer-border rounded-[2rem] border border-white/10 shadow-glow-blue overflow-hidden">
      <div className="px-6 py-6 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(217,179,108,0.16),transparent_38%),linear-gradient(90deg,rgba(138,180,255,0.08),transparent)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl premium-pill flex items-center justify-center">
            <svg className="w-5 h-5 text-[#f1d39a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="section-eyebrow mb-1">Priority Queue</p>
            <h3 className="text-[2rem] font-display font-semibold text-white">Executive Next Actions</h3>
            <p className="text-sm text-zinc-400 mt-0.5">Highest-impact tasks to protect launch readiness.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {topActions.map((action, idx) => (
          <Link
            key={action.id}
            href={`/roadmap?section=${encodeURIComponent(action.task.section)}`}
            className="block group"
          >
            <div
              className={cn(
                'p-5 rounded-[1.5rem] border transition-all duration-300 hover:-translate-y-1',
                action.type === 'blocked' && 'border-red-300/20 bg-red-400/[0.05] hover:border-red-300/35 neon-red',
                action.type === 'critical' && 'border-[#d9b36c]/25 bg-[#d9b36c]/[0.06] hover:border-[#d9b36c]/40',
                action.type === 'in-progress' && 'border-[#8ab4ff]/25 bg-[#8ab4ff]/[0.06] hover:border-[#8ab4ff]/40'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl premium-pill flex items-center justify-center font-mono font-bold text-sm text-zinc-200">
                  {idx + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-semibold text-white leading-snug group-hover:text-[#f6e7c4] transition-colors">
                      {action.task.task}
                    </h4>
                    {action.type === 'blocked' && (
                      <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-red-400/10 text-red-200 text-[10px] font-bold uppercase tracking-[0.18em] border border-red-300/15">
                        Blocked
                      </span>
                    )}
                    {action.type === 'critical' && (
                      <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[#d9b36c]/10 text-[#f1d39a] text-[10px] font-bold uppercase tracking-[0.18em] border border-[#d9b36c]/15">
                        Critical
                      </span>
                    )}
                    {action.type === 'in-progress' && (
                      <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[#8ab4ff]/10 text-[#bdd5ff] text-[10px] font-bold uppercase tracking-[0.18em] border border-[#8ab4ff]/15">
                        In Progress
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-zinc-400 mb-2">
                    {action.task.section} • {action.task.category}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500">↳</span>
                    <span className={cn(
                      'font-medium',
                      action.type === 'blocked' && 'text-red-200',
                      action.type === 'critical' && 'text-[#f1d39a]',
                      action.type === 'in-progress' && 'text-[#bdd5ff]'
                    )}>
                      {action.reason}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
