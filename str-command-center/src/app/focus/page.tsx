'use client';

import { useMemo, useState } from 'react';
import { useApp } from '@/lib/context';
import { 
  getBlockedTasks, 
  getInProgressTasks, 
  getIncompletePreListingTasks,
  getPinnedTasks,
  isTaskCompleted,
  getTaskStatus,
} from '@/lib/selectors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';
import { TaskModal } from '../roadmap/task-modal';

export default function FocusPage() {
  const { state, isLoaded, toggleTask } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const blockedTasks = useMemo(() => 
    isLoaded ? getBlockedTasks(state) : [], 
    [state, isLoaded]
  );

  const inProgressTasks = useMemo(() => 
    isLoaded ? getInProgressTasks(state) : [], 
    [state, isLoaded]
  );

  const pinnedTasks = useMemo(() => 
    isLoaded ? getPinnedTasks(state) : [], 
    [state, isLoaded]
  );

  const urgentPreListing = useMemo(() => {
    if (!isLoaded) return [];
    const incomplete = getIncompletePreListingTasks(state);
    // Get first 10 incomplete pre-listing tasks that aren't already blocked/in-progress
    return incomplete
      .filter(t => {
        const status = state.taskMeta[t.id]?.status;
        return status !== 'blocked' && status !== 'in-progress';
      })
      .slice(0, 10);
  }, [state, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const totalFocus = blockedTasks.length + inProgressTasks.length + pinnedTasks.length;

  const TaskRow = ({ task, variant }: { task: Task; variant: 'blocked' | 'in-progress' | 'pinned' | 'urgent' }) => {
    const isCompleted = isTaskCompleted(state, task.id);
    const status = getTaskStatus(state, task.id);

    const variantStyles = {
      blocked: 'border-l-2 border-red-500 bg-red-500/5',
      'in-progress': 'border-l-2 border-amber-500 bg-amber-500/5',
      pinned: 'border-l-2 border-indigo-500 bg-indigo-500/5',
      urgent: '',
    };

    return (
      <div
        className={cn(
          'flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer rounded-lg',
          variantStyles[variant]
        )}
        onClick={() => setSelectedTask(task)}
      >
        <Checkbox
          checked={isCompleted}
          onChange={() => toggleTask(task.id)}
        />
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm',
            isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
          )}>
            {task.task}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="timing" timing={task.timing}>
              {task.timing}
            </Badge>
            {status !== 'default' && (
              <Badge variant="status" status={status}>
                {status.replace('-', ' ')}
              </Badge>
            )}
            <span className="text-[10px] text-slate-500">
              {task.section.replace(' Master Checklist', '')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">⚡</span>
          <h1 className="text-3xl font-bold text-white">Focus Mode</h1>
        </div>
        <p className="text-slate-400">
          {totalFocus} items need your attention
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-3xl font-bold text-red-400">{blockedTasks.length}</p>
            <p className="text-xs text-slate-500 mt-1">Blocked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-3xl font-bold text-amber-400">{inProgressTasks.length}</p>
            <p className="text-xs text-slate-500 mt-1">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-3xl font-bold text-indigo-400">{pinnedTasks.length}</p>
            <p className="text-xs text-slate-500 mt-1">Pinned</p>
          </CardContent>
        </Card>
      </div>

      {/* Blocked Tasks */}
      {blockedTasks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <span>🚫</span>
              Blocked ({blockedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockedTasks.map(task => (
              <TaskRow key={task.id} task={task} variant="blocked" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* In Progress */}
      {inProgressTasks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <span>🔄</span>
              In Progress ({inProgressTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inProgressTasks.map(task => (
              <TaskRow key={task.id} task={task} variant="in-progress" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pinned */}
      {pinnedTasks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-400">
              <span>📌</span>
              Pinned ({pinnedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pinnedTasks.map(task => (
              <TaskRow key={task.id} task={task} variant="pinned" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Next Up: Pre-Listing */}
      {urgentPreListing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📋</span>
              Next Pre-Listing Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {urgentPreListing.map(task => (
              <TaskRow key={task.id} task={task} variant="urgent" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalFocus === 0 && urgentPreListing.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-xl font-medium text-white mb-2">All clear!</p>
            <p className="text-slate-400">No blocked or in-progress items</p>
          </CardContent>
        </Card>
      )}

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
