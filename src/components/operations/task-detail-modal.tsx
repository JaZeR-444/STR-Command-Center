'use client';

import { useState } from 'react';
import { properties } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { OperationsTask, OperationsTaskStatus } from '@/types';

const statusColors = {
  queued: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusLabels = {
  queued: 'Queued',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function TaskDetailModal({
  task,
  onClose,
  onUpdateStatus,
}: {
  task: OperationsTask;
  onClose: () => void;
  onUpdateStatus?: (taskId: string, status: OperationsTaskStatus) => void;
}) {
  const [localChecklist, setLocalChecklist] = useState(task.checklist || []);
  const property = properties.find(p => p.id === task.propertyId);
  const scheduledDate = new Date(task.scheduledDate);

  const handleStatusChange = (newStatus: OperationsTaskStatus) => {
    onUpdateStatus?.(task.id, newStatus);
  };

  const completedCount = localChecklist.filter(Boolean).length;
  const totalCount = localChecklist.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl border-2 border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 glass px-6 py-4 border-b border-zinc-800 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium capitalize border bg-zinc-900/50 text-zinc-400 border-zinc-700">
                {task.type}
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded text-xs font-medium border',
                statusColors[task.status]
              )}>
                {statusLabels[task.status]}
              </span>
            </div>
            <h2 className="text-xl font-display font-bold text-white">{task.title}</h2>
            {property && (
              <p className="text-sm text-zinc-500 mt-1">{property.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-zinc-300">{task.description}</p>
            </div>
          )}

          {/* Schedule Info */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-1">Date</p>
                <p className="text-sm font-semibold text-white">
                  {scheduledDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              {task.scheduledTimeStart && (
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Time</p>
                  <p className="text-sm font-semibold text-white">
                    {task.scheduledTimeStart}
                    {task.scheduledTimeEnd && ` - ${task.scheduledTimeEnd}`}
                  </p>
                </div>
              )}
              {task.estimatedDuration && (
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Estimated Duration</p>
                  <p className="text-sm font-semibold text-white">
                    {task.estimatedDuration} minutes
                  </p>
                </div>
              )}
              {task.actualDuration && (
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Actual Duration</p>
                  <p className="text-sm font-semibold text-emerald-400">
                    {task.actualDuration} minutes
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Assignee */}
          {task.assigneeName && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Assigned To</h3>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                {task.assigneeName}
              </div>
            </div>
          )}

          {/* Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Checklist</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{progress}% complete</span>
                  <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {task.checklist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-900/70 transition-colors"
                  >
                    <div className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5',
                      'bg-zinc-800 border-zinc-700'
                    )}>
                      {localChecklist[index] && (
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                    </div>
                    <span className={cn(
                      'text-sm flex-1',
                      localChecklist[index] ? 'text-zinc-500 line-through' : 'text-zinc-300'
                    )}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Notes</h3>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <p className="text-sm text-zinc-300">{task.notes}</p>
              </div>
            </div>
          )}

          {/* Status Actions */}
          {task.status !== 'completed' && task.status !== 'cancelled' && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="flex gap-2">
                {task.status === 'queued' && (
                  <Button
                    onClick={() => handleStatusChange('in_progress')}
                    variant="primary"
                    className="flex-1"
                  >
                    Start Task
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <>
                    <Button
                      onClick={() => handleStatusChange('completed')}
                      variant="primary"
                      className="flex-1"
                    >
                      Mark Complete
                    </Button>
                    <Button
                      onClick={() => handleStatusChange('queued')}
                      variant="ghost"
                      className="flex-1"
                    >
                      Move to Queue
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Completion Info */}
          {task.status === 'completed' && task.completedAt && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-semibold">Task Completed</span>
              </div>
              <p className="text-sm text-zinc-400 ml-7">
                {new Date(task.completedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
