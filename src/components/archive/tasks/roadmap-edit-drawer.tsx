'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/input';
import { isTaskCompleted, getTaskStatus } from '@/lib/selectors';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';
import Link from 'next/link';
import { documentationData } from '@/data/documents';

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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RoadmapEditDrawer({ task, onClose }: RoadmapEditDrawerProps) {
  const { state, toggleTask, setTaskStatus, setTaskNote } = useApp();
  const [note, setNote] = useState('');
  const [noteDirty, setNoteDirty] = useState(false);

  useEffect(() => {
    if (task) {
      setNote(state.taskMeta[task.id]?.note || '');
      setNoteDirty(false);
    }
  }, [task, state.taskMeta]);

  // Auto-save note on close — no explicit button needed
  const handleClose = useCallback(() => {
    if (task && noteDirty) {
      setTaskNote(task.id, note);
    }
    onClose();
  }, [task, noteDirty, note, setTaskNote, onClose]);

  // Also save when ESC / backdrop pressed
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  if (!task) return null;

  const isCompleted = isTaskCompleted(state, task.id);
  const currentStatus = getTaskStatus(state, task.id);
  const linkedDocIds = state.taskMeta[task.id]?.linkedDocuments || [];
  const linkedDocs = linkedDocIds
    .map(id => documentationData.find(d => d.id === id))
    .filter(Boolean) as typeof documentationData;
  const taskActivityLog = state.taskMeta[task.id]?.activityLog || [];

  const handleStatusChange = (status: TaskStatus) => {
    setTaskStatus(task.id, status);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={handleClose}
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
              onClick={handleClose}
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
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {isCompleted ? 'Task Completed' : 'Mark as Complete'}
              </p>
              <p className="text-xs text-zinc-500">
                {isCompleted
                  ? `Completed ${state.taskMeta[task.id]?.completedAt ? timeAgo(state.taskMeta[task.id].completedAt!) : ''} · Click to reopen`
                  : 'Click when finished'}
              </p>
            </div>
            {/* Quick In Progress button */}
            {!isCompleted && currentStatus !== 'in-progress' && (
              <button
                onClick={() => handleStatusChange('in-progress')}
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/25 transition-colors"
              >
                Start →
              </button>
            )}
            {!isCompleted && currentStatus === 'in-progress' && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg">
                In Progress
              </span>
            )}
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

          {/* Notes — auto-saves on drawer close */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Notes
              </h3>
              {noteDirty && (
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest animate-pulse">
                  Unsaved · closes auto-saves
                </span>
              )}
            </div>
            <Textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setNoteDirty(true);
              }}
              placeholder="Add notes, blockers, or context..."
              rows={5}
              className="w-full"
            />
            <p className="mt-2 text-[10px] text-zinc-600">Notes are saved automatically when you close this drawer.</p>
          </div>

          {/* Linked Documents */}
          {linkedDocs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Linked Documents ({linkedDocs.length})
              </h3>
              <div className="space-y-2">
                {linkedDocs.map(doc => {
                  const isDocDone = state.completedDocIds.includes(doc.id);
                  return (
                    <Link
                      key={doc.id}
                      href={`/documents?section=${encodeURIComponent(doc.section)}`}
                      className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors group"
                    >
                      <span className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        isDocDone ? 'bg-emerald-500' : 'bg-zinc-600'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 font-medium truncate group-hover:text-white">{doc.artifact}</p>
                        <p className="text-[10px] text-zinc-600">{doc.type} · {doc.timing}</p>
                      </div>
                      <svg className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Task Activity Log */}
          {taskActivityLog.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Activity Log
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {taskActivityLog.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300">{entry.action}</p>
                      {entry.details && (
                        <p className="text-[10px] text-zinc-600 truncate">{entry.details}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-700 shrink-0">{timeAgo(entry.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-6 border-t border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Task Metadata
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Section</span>
                <span className="text-zinc-300 font-medium">{task.section.replace(' Master Checklist', '')}</span>
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
