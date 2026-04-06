'use client';

import { Suspense, useState, useMemo, useRef } from 'react';
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
import { RoadmapEditDrawer } from '@/components/roadmap-edit-drawer';
import { TaskListSkeleton } from '@/components/ui/skeleton';
import { cn, getProgressColor } from '@/lib/utils';
import type { Task, TaskTiming } from '@/types';

function RoadmapContent() {
  const searchParams = useSearchParams();
  const initialSection = searchParams.get('section') || sections[0];
  
  const { state, isLoaded, toggleTask } = useApp();
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [timingFilter, setTimingFilter] = useState<'All' | TaskTiming>('All');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'incomplete' | 'complete'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    const blocked = sectionTasks.filter(t => state.taskMeta[t.id]?.status === 'blocked').length;
    return {
      total,
      completed,
      blocked,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [sectionTasks, state.completedIds, state.taskMeta]);

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    // Don't open drawer if clicking checkbox
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    setSelectedTask(task);
  };

  if (!isLoaded) {
    return (
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <TaskListSkeleton />
      </div>
    );
  }

  return (
    <>
      <div ref={scrollContainerRef} className="max-w-6xl mx-auto p-6 lg:p-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            Task Roadmap
          </h1>
          <p className="text-zinc-400 text-lg">Complete and track tasks across all sections</p>
        </header>

        {/* Section Selector & Progress */}
        <Card className="mb-6">
          <CardContent className="py-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="flex-1">
                <Select
                  label="Section"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  options={sections.map(s => ({
                    value: s,
                    label: getShortSectionName(s),
                  }))}
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={cn('text-3xl font-bold', getProgressColor(sectionStats.percentage))}>
                    {sectionStats.percentage}%
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider">Complete</div>
                </div>
                {sectionStats.blocked > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400">
                      {sectionStats.blocked}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Blocked</div>
                  </div>
                )}
              </div>
            </div>
            <ProgressBar value={sectionStats.percentage} size="md" />
            <p className="text-sm text-zinc-500 mt-3">
              {sectionStats.completed} of {sectionStats.total} tasks completed
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 z-20 bg-zinc-950 py-4 -mt-4">
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
        <div className="space-y-6">
          {Object.entries(groupedTasks).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-zinc-500">
                <p className="text-lg mb-2">No tasks match your filters</p>
                <p className="text-sm">Try adjusting your filters above</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedTasks).map(([category, tasks]) => (
              <div key={category}>
                {/* Sticky Category Header */}
                <div className="sticky top-20 z-10 bg-zinc-950/95 backdrop-blur-sm py-3 mb-3 border-b border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-500 rounded-full" />
                      {category}
                    </h3>
                    <span className="text-sm text-zinc-500 font-medium">
                      {tasks.filter(t => state.completedIds.includes(t.id)).length} / {tasks.length} complete
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <Card>
                  <div className="divide-y divide-zinc-800">
                    {tasks.map(task => {
                      const isCompleted = isTaskCompleted(state, task.id);
                      const status = getTaskStatus(state, task.id);
                      const hasNote = state.taskMeta[task.id]?.note;

                      return (
                        <div
                          key={task.id}
                          className={cn(
                            'flex items-start gap-4 p-4 hover:bg-zinc-900/50 transition-all cursor-pointer group',
                            status === 'blocked' && 'bg-red-500/5 border-l-4 border-red-500',
                            status === 'in-progress' && 'bg-amber-500/5 border-l-4 border-amber-500',
                            status === 'na' && 'opacity-50'
                          )}
                          onClick={(e) => handleTaskClick(task, e)}
                        >
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isCompleted}
                              onChange={() => toggleTask(task.id)}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm font-medium mb-1',
                              isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200',
                              status === 'na' && 'line-through'
                            )}>
                              {task.task}
                            </p>
                            {task.description && (
                              <p className="text-xs text-zinc-500 mb-2 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="timing" timing={task.timing}>
                                {task.timing}
                              </Badge>
                              {status !== 'default' && (
                                <Badge variant="status" status={status}>
                                  {status === 'in-progress' ? 'Active' : status === 'na' ? 'N/A' : 'Blocked'}
                                </Badge>
                              )}
                              {hasNote && (
                                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                  </svg>
                                  Note
                                </span>
                              )}
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-12 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Currently viewing</p>
              <p className="text-lg font-semibold text-white">{getShortSectionName(selectedSection)}</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Object.keys(groupedTasks).length}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{filteredTasks.length}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Tasks Shown</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      <RoadmapEditDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}

// Loading fallback
function RoadmapLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-zinc-400">Loading roadmap...</div>
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
