'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context';
import { sections, tasksBySection, getShortSectionName } from '@/data/roadmap';
import { filterTasks, groupTasksByCategory, isTaskCompleted, getTaskStatus } from '@/lib/selectors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input, Select } from '@/components/ui/input';
import { cn, getProgressColor } from '@/lib/utils';
import type { Task, TaskTiming } from '@/types';
import { TaskModal } from './task-modal';

function RoadmapContent() {
  const searchParams = useSearchParams();
  const initialSection = searchParams.get('section') || sections[0];
  
  const { state, isLoaded, toggleTask } = useApp();
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [timingFilter, setTimingFilter] = useState<'All' | TaskTiming>('All');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'incomplete' | 'complete'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Get tasks for selected section
  const sectionTasks = useMemo(() => {
    return tasksBySection[selectedSection] || [];
  }, [selectedSection]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!isLoaded) return [];
    return filterTasks(
      sectionTasks,
      { timing: timingFilter, completion: completionFilter, search: searchTerm },
      state
    );
  }, [sectionTasks, timingFilter, completionFilter, searchTerm, state, isLoaded]);

  // Group by category
  const groupedTasks = useMemo(() => {
    return groupTasksByCategory(filteredTasks);
  }, [filteredTasks]);

  // Section stats
  const sectionStats = useMemo(() => {
    const total = sectionTasks.length;
    const completed = sectionTasks.filter(t => state.completedIds.includes(t.id)).length;
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [sectionTasks, state.completedIds]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Roadmap</h1>
        <p className="text-slate-400">Track and complete tasks across all sections</p>
      </header>

      {/* Section Selector */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <Select
            label="Section"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            options={sections.map(s => ({
              value: s,
              label: getShortSectionName(s),
            }))}
          />
        </CardContent>
      </Card>

      {/* Section Progress */}
      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-white">
              {getShortSectionName(selectedSection)}
            </h2>
            <span className={cn('text-2xl font-bold', getProgressColor(sectionStats.percentage))}>
              {sectionStats.percentage}%
            </span>
          </div>
          <ProgressBar value={sectionStats.percentage} size="md" />
          <p className="text-sm text-slate-500 mt-2">
            {sectionStats.completed} of {sectionStats.total} tasks completed
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['All', 'Pre-Listing', 'Ongoing', 'Post-Listing'] as const).map(timing => (
            <Button
              key={timing}
              variant={timingFilter === timing ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimingFilter(timing)}
            >
              {timing}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'incomplete', 'complete'] as const).map(comp => (
            <Button
              key={comp}
              variant={completionFilter === comp ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCompletionFilter(comp)}
            >
              {comp === 'all' ? 'All' : comp === 'incomplete' ? 'Todo' : 'Done'}
            </Button>
          ))}
        </div>
        <div className="flex-1 md:max-w-xs">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Task Categories */}
      <div className="space-y-4">
        {Object.entries(groupedTasks).length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              No tasks match your filters
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedTasks).map(([category, tasks]) => (
            <Card key={category}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-300">{category}</h3>
                  <span className="text-xs text-slate-500">
                    {tasks.filter(t => state.completedIds.includes(t.id)).length} / {tasks.length}
                  </span>
                </div>
              </CardHeader>
              <div className="divide-y divide-border-dark">
                {tasks.map(task => {
                  const isCompleted = isTaskCompleted(state, task.id);
                  const status = getTaskStatus(state, task.id);
                  const hasNote = state.taskMeta[task.id]?.note;

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer',
                        status === 'blocked' && 'border-l-2 border-red-500',
                        status === 'in-progress' && 'border-l-2 border-amber-500'
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
                        {task.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="timing" timing={task.timing}>
                            {task.timing}
                          </Badge>
                          {status !== 'default' && (
                            <Badge variant="status" status={status}>
                              {status.replace('-', ' ')}
                            </Badge>
                          )}
                          {hasNote && (
                            <span className="text-[10px] text-slate-500">📝 Has note</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

// Loading fallback
function RoadmapLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-slate-400">Loading roadmap...</div>
    </div>
  );
}

// Export wrapped in Suspense
export default function RoadmapPage() {
  return (
    <Suspense fallback={<RoadmapLoading />}>
      <RoadmapContent />
    </Suspense>
  );
}
