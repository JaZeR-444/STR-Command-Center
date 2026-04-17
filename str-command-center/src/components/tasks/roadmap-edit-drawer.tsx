'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/input';
import { isTaskCompleted, getTaskStatus } from '@/lib/selectors';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';

interface RoadmapEditDrawerProps {
  task: Task | null;
  onClose: () => void;
}

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'default', label: 'Default', color: 'zinc' },
  { value: 'in-progress', label: 'In Progress', color: 'amber' },
  { value: 'blocked', label: 'Blocked', color: 'red' },
  { value: 'na', label: 'N/A', color: 'zinc' },
];

export function RoadmapEditDrawer({ task, onClose }: RoadmapEditDrawerProps) {
  const { state, toggleTask, setTaskStatus, setTaskNote } = useApp();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (task) {
      setNote(state.taskMeta[task.id]?.note || '');
    }
  }, [task, state.taskMeta]);

  if (!task) return null;

  const isCompleted = isTaskCompleted(state, task.id);
  const currentStatus = getTaskStatus(state, task.id);

  const handleSaveNote = () => {
    setTaskNote(task.id, note);
  };

  const handleStatusChange = (status: TaskStatus) => {
    setTaskStatus(task.id, status);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 p-6 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-2">
                {task.task}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="timing" timing={task.timing}>
                  {task.timing}
                </Badge>
                <span className="text-xs text-zinc-600">•</span>
                <span className="text-xs text-zinc-500">{task.category}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Completion */}
          <div className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Checkbox
              checked={isCompleted}
              onChange={() => toggleTask(task.id)}
            />
            <div>
              <p className="text-sm font-medium text-white">
                {isCompleted ? 'Task Completed' : 'Mark as Complete'}
              </p>
              <p className="text-xs text-zinc-500">
                {isCompleted ? 'Click to reopen task' : 'Click when finished'}
              </p>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Description
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={cn(
                    'px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                    currentStatus === option.value
                      ? option.value === 'blocked'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : option.value === 'in-progress'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-zinc-700 border-zinc-600 text-zinc-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Notes
            </h3>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes, blockers, or context..."
              rows={6}
              className="w-full"
            />
            <Button
              onClick={handleSaveNote}
              variant="primary"
              size="sm"
              className="mt-3"
            >
              Save Note
            </Button>
          </div>

          {/* Metadata */}
          <div className="pt-6 border-t border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Task Metadata
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Section</span>
                <span className="text-zinc-300 font-medium">{task.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Category</span>
                <span className="text-zinc-300 font-medium">{task.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Timing</span>
                <span className="text-zinc-300 font-medium">{task.timing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Task ID</span>
                <span className="text-zinc-300 font-medium">#{task.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
