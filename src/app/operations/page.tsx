'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { TaskCard } from '@/components/operations/task-card';
import { TaskDetailModal } from '@/components/operations/task-detail-modal';
import { cn } from '@/lib/utils';
import type { OperationsTask, OperationsTaskType, OperationsTaskStatus } from '@/types';

export default function OperationsPage() {
  const { state } = useApp();
  const { operationsTasks } = state;
  const [selectedTask, setSelectedTask] = useState<OperationsTask | null>(null);
  const [filterType, setFilterType] = useState<'all' | OperationsTaskType>('all');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | OperationsTaskStatus>('active');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = operationsTasks;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(t => t.status === 'queued' || t.status === 'in_progress');
    } else if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.assigneeName?.toLowerCase().includes(term)
      );
    }

    // Sort: queued first, then in_progress, then by date
    return filtered.sort((a, b) => {
      const statusOrder = { queued: 0, in_progress: 1, completed: 2, cancelled: 3 };
      if (a.status !== b.status) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });
  }, [operationsTasks, filterType, filterStatus, searchTerm]);

  // Group by status
  const groupedTasks = useMemo(() => {
    return {
      queued: filteredTasks.filter(t => t.status === 'queued'),
      in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
      completed: filteredTasks.filter(t => t.status === 'completed'),
      cancelled: filteredTasks.filter(t => t.status === 'cancelled'),
    };
  }, [filteredTasks]);

  const handleUpdateStatus = (taskId: string, newStatus: OperationsTaskStatus) => {
    console.log('Update task status:', taskId, newStatus);
    alert('Task status update will be implemented with full context integration');
    // TODO: Implement via context method
  };

  const queuedCount = operationsTasks.filter(t => t.status === 'queued').length;
  const inProgressCount = operationsTasks.filter(t => t.status === 'in_progress').length;
  const completedTodayCount = operationsTasks.filter(t => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    const completedDate = new Date(t.completedAt).toDateString();
    return completedDate === new Date().toDateString();
  }).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9.1 19a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.8 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.7a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
          </svg>
          Operations Queue
        </h1>
        <p className="text-zinc-400 text-sm mt-2">Manage turnover, maintenance, and inspections</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Queued</p>
              <p className="text-2xl font-bold text-amber-400">{queuedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{inProgressCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Completed Today</p>
              <p className="text-2xl font-bold text-emerald-400">{completedTodayCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filterType === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('cleaning')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filterType === 'cleaning'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              Cleaning
            </button>
            <button
              onClick={() => setFilterType('maintenance')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filterType === 'maintenance'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              Maintenance
            </button>
            <button
              onClick={() => setFilterType('inspection')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filterType === 'inspection'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              Inspection
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('active')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filterStatus === 'active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Task Queue */}
      {filterStatus === 'active' || filterStatus === 'all' ? (
        <div className="space-y-6">
          {/* Queued Tasks */}
          {groupedTasks.queued.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                Queued ({groupedTasks.queued.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedTasks.queued.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Progress Tasks */}
          {groupedTasks.in_progress.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                In Progress ({groupedTasks.in_progress.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedTasks.in_progress.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks (if showing all) */}
          {filterStatus === 'all' && groupedTasks.completed.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Completed ({groupedTasks.completed.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedTasks.completed.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="glass rounded-2xl border-2 border-zinc-800 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9.1 19a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.8 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.7a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">No Tasks Found</h2>
          <p className="text-zinc-400">
            {searchTerm
              ? `No tasks match "${searchTerm}"`
              : 'All tasks completed! Great work.'}
          </p>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
