'use client';

import { Suspense, useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context';
import { sections, tasksBySection, getShortSectionName, getSectionNumber } from '@/data/roadmap';
import { filterTasks, groupTasksByCategory, isTaskCompleted, getTaskStatus } from '@/lib/selectors';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RoadmapEditDrawer } from '@/components/roadmap-edit-drawer';
import { TaskQuickActions } from '@/components/task-quick-actions';
import { TaskListSkeleton } from '@/components/ui/skeleton';
import { cn, getProgressColor } from '@/lib/utils';
import type { Task, TaskTiming } from '@/types';

/* ─── Section Tab Strip ──────────────────────────────────────── */

function SectionTabStrip({
  sections,
  selectedSection,
  onSelect,
  sectionStats,
}: {
  sections: string[];
  selectedSection: string;
  onSelect: (s: string) => void;
  sectionStats: Record<string, { pct: number; blocked: number }>;
}) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view on section change
  useEffect(() => {
    if (activeRef.current && tabsRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedSection]);

  return (
    <div className="relative">
      {/* Scrollable tab row */}
      <div
        ref={tabsRef}
        className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {sections.map((section) => {
          const isActive = section === selectedSection;
          const num = getSectionNumber(section);
          const name = getShortSectionName(section);
          const stats = sectionStats[section] ?? { pct: 0, blocked: 0 };

          return (
            <button
              key={section}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSelect(section)}
              className={cn(
                'flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl border shrink-0 transition-all duration-150 text-left min-w-[120px] max-w-[160px]',
                isActive
                  ? 'bg-blue-500/15 border-blue-500/40 text-white'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
              )}
            >
              <div className="flex items-center justify-between w-full gap-1">
                <span className={cn(
                  'text-[9px] font-bold uppercase tracking-widest',
                  isActive ? 'text-blue-400' : 'text-zinc-600'
                )}>
                  {num.padStart(2, '0')}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  {stats.blocked > 0 && (
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 text-[8px] font-bold flex items-center justify-center">
                      {stats.blocked}
                    </span>
                  )}
                  <span className={cn(
                    'text-[10px] font-bold',
                    getProgressColor(stats.pct)
                  )}>
                    {stats.pct}%
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold leading-tight line-clamp-2 w-full">{name}</span>
              {/* Mini progress bar */}
              <div className="w-full h-0.5 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    stats.pct >= 100 ? 'bg-emerald-500' : stats.pct >= 50 ? 'bg-amber-500' : 'bg-blue-500'
                  )}
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
      {/* Fade edges to hint at scroll */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-1 w-4 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-4 bg-gradient-to-l from-zinc-950 to-transparent" />
    </div>
  );
}

/* ─── Category Group ─────────────────────────────────────────── */

function CategoryGroup({
  category,
  tasks,
  state,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
  onTaskClick,
  toggleTask,
  togglePin,
  setTaskStatus,
}: {
  category: string;
  tasks: Task[];
  state: ReturnType<typeof useApp>['state'];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onTaskClick: (task: Task, e: React.MouseEvent) => void;
  toggleTask: (id: number) => void;
  togglePin: (id: number) => void;
  setTaskStatus: (id: number, status: 'default' | 'blocked' | 'in-progress' | 'na') => void;
}) {
  const completedCount = tasks.filter(t => state.completedIds.includes(t.id)).length;
  const isAllDone = completedCount === tasks.length;
  const blockedCount = tasks.filter(t => state.taskMeta[t.id]?.status === 'blocked').length;

  return (
    <div>
      {/* Sticky Category Header */}
      <div
        className="sticky top-[52px] z-10 bg-zinc-950/97 backdrop-blur-sm py-2.5 mb-2 border-b border-zinc-800/70 cursor-pointer select-none"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Collapse chevron */}
            <svg
              className={cn(
                'w-3.5 h-3.5 text-zinc-600 shrink-0 transition-transform duration-200',
                externalCollapsed ? '-rotate-90' : 'rotate-0'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>

            {/* Active indicator or done check */}
            {isAllDone ? (
              <span className="w-1 h-5 bg-emerald-500 rounded-full shrink-0" />
            ) : (
              <span className="w-1 h-5 bg-blue-500 rounded-full shrink-0" />
            )}

            <h3 className={cn(
              'text-sm font-bold truncate',
              isAllDone ? 'text-zinc-500' : 'text-white'
            )}>
              {category}
            </h3>

            {isAllDone && (
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full font-bold uppercase tracking-wider shrink-0">
                Done ✓
              </span>
            )}
            {blockedCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 bg-red-500/15 text-red-400 rounded-full font-bold uppercase tracking-wider shrink-0">
                {blockedCount} blocked
              </span>
            )}
          </div>

          <span className="text-xs text-zinc-600 font-medium shrink-0">
            {completedCount}/{tasks.length}
          </span>
        </div>
      </div>

      {/* Task list — hidden when collapsed */}
      {!externalCollapsed && (
        <Card className="mb-4">
          <div className="divide-y divide-zinc-800/60">
            {tasks.map(task => {
              const isCompleted = isTaskCompleted(state, task.id);
              const status = getTaskStatus(state, task.id);
              const hasNote = !!state.taskMeta[task.id]?.note;
              const isPinned = state.pinnedIds.includes(task.id);

              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 hover:bg-zinc-900/40 transition-all cursor-pointer group relative',
                    status === 'blocked' && 'bg-red-500/5 border-l-2 border-l-red-500',
                    status === 'in-progress' && 'bg-amber-500/5 border-l-2 border-l-amber-500',
                    status === 'na' && 'opacity-40'
                  )}
                  onClick={(e) => onTaskClick(task, e)}
                >
                  {/* Checkbox */}
                  <div
                    className="mt-0.5 shrink-0"
                    onClick={e => { e.stopPropagation(); toggleTask(task.id); }}
                  >
                    <Checkbox checked={isCompleted} onChange={() => toggleTask(task.id)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium leading-snug mb-1',
                      isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200',
                      status === 'na' && 'line-through'
                    )}>
                      {task.task}
                    </p>

                    {task.description && (
                      <p className="text-xs text-zinc-500 mb-1.5 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="timing" timing={task.timing}>{task.timing}</Badge>
                      {status !== 'default' && (
                        <Badge variant="status" status={status}>
                          {status === 'in-progress' ? 'Active' : status === 'na' ? 'N/A' : 'Blocked'}
                        </Badge>
                      )}
                      {hasNote && (
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Note
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── HOVER QUICK ACTIONS (NEW) ── */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <TaskQuickActions
                      taskId={task.id}
                      isCompleted={isCompleted}
                      isPinned={isPinned}
                      isBlocked={status === 'blocked'}
                      hasNote={hasNote}
                      onToggleComplete={() => toggleTask(task.id)}
                      onTogglePin={() => togglePin(task.id)}
                      onToggleBlocked={() => {
                        if (status === 'blocked') {
                          setTaskStatus(task.id, 'default');
                        } else {
                          setTaskStatus(task.id, 'blocked');
                        }
                      }}
                      onAddNote={() => {
                        // Simulate click to open drawer
                        const e = { stopPropagation: () => {}, preventDefault: () => {} } as React.MouseEvent;
                        onTaskClick(task, e);
                      }}
                      className="mr-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─── Main Roadmap Content ───────────────────────────────────── */

function RoadmapContent() {
  const searchParams = useSearchParams();
  const initialSection = searchParams.get('section') || sections[0];

  const { state, isLoaded, toggleTask, togglePin, setTaskStatus, toggleCategory, isCategoryCollapsed } = useApp();
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [timingFilter, setTimingFilter] = useState<'All' | TaskTiming>('All');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'incomplete' | 'complete'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Compute per-section stats for tab strip
  const sectionStats = useMemo(() => {
    const out: Record<string, { pct: number; blocked: number }> = {};
    for (const section of sections) {
      const tasks = tasksBySection[section] || [];
      const total = tasks.length;
      const completed = tasks.filter(t => state.completedIds.includes(t.id)).length;
      const blocked = tasks.filter(t => state.taskMeta[t.id]?.status === 'blocked').length;
      out[section] = {
        pct: total > 0 ? Math.round((completed / total) * 100) : 0,
        blocked,
      };
    }
    return out;
  }, [state]);

  // Tasks for the selected section
  const sectionTasks = useMemo(() => tasksBySection[selectedSection] || [], [selectedSection]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (!isLoaded) return [];
    return filterTasks(sectionTasks, { timing: timingFilter, completion: completionFilter, search: searchTerm }, state);
  }, [sectionTasks, timingFilter, completionFilter, searchTerm, state, isLoaded]);

  // Grouped by category
  const groupedTasks = useMemo(() => groupTasksByCategory(filteredTasks), [filteredTasks]);

  // Section summary stats
  const sectionStats_local = useMemo(() => {
    const total = sectionTasks.length;
    const completed = sectionTasks.filter(t => state.completedIds.includes(t.id)).length;
    const blocked = sectionTasks.filter(t => state.taskMeta[t.id]?.status === 'blocked').length;
    return {
      total, completed, blocked,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [sectionTasks, state]);

  // ── #3 HIGH IMPACT: Auto-collapse completed categories ──
  // On section change, auto-collapse categories that are 100% done
  useEffect(() => {
    const cats = Object.entries(groupTasksByCategory(sectionTasks));
    for (const [cat, tasks] of cats) {
      const allDone = tasks.every(t => state.completedIds.includes(t.id));
      const key = `${selectedSection}::${cat}`;
      if (allDone && !isCategoryCollapsed(key)) {
        toggleCategory(key);
      }
    }
    // Only run on section change, not on every state change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection]);

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
    setSelectedTask(task);
  };

  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    setTimingFilter('All');
    setCompletionFilter('all');
    setSearchTerm('');
  };

  if (!isLoaded) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <TaskListSkeleton />
      </div>
    );
  }

  const stats = sectionStats_local;

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">

        {/* ── Header ── */}
        <header className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5 leading-tight">
            <span className="text-2xl">🗺️</span>
            Task Roadmap
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Complete and track tasks across all 11 sections</p>
        </header>

        {/* ── #1 HIGH IMPACT: Section Tab Strip ── */}
        <div className="mb-5">
          <SectionTabStrip
            sections={sections}
            selectedSection={selectedSection}
            onSelect={handleSectionChange}
            sectionStats={sectionStats}
          />
        </div>

        {/* ── Active section progress bar ── */}
        <div className="mb-5 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest shrink-0">
                {getSectionNumber(selectedSection).padStart(2, '0')}
              </span>
              <h2 className="text-sm font-bold text-zinc-200 truncate">
                {getShortSectionName(selectedSection)}
              </h2>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {stats.blocked > 0 && (
                <span className="text-xs text-red-400 font-semibold">{stats.blocked} blocked</span>
              )}
              <span className={cn('text-lg font-extrabold', getProgressColor(stats.percentage))}>
                {stats.percentage}%
              </span>
            </div>
          </div>
          <ProgressBar value={stats.percentage} size="md" />
          <p className="text-xs text-zinc-600 mt-2">
            {stats.completed} of {stats.total} tasks completed
          </p>
        </div>

        {/* ── Filter bar ── */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5 sticky top-0 z-20 bg-zinc-950 py-3 -mt-3">
          {/* Timing filters */}
          <div className="flex gap-1.5 flex-wrap">
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
          {/* Completion filters */}
          <div className="flex gap-1.5">
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
          {/* Search */}
          <div className="flex-1 sm:max-w-xs">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Expand all / Collapse all */}
          <div className="flex gap-1.5 ml-auto shrink-0">
            <button
              onClick={() => {
                Object.keys(groupedTasks).forEach(cat => {
                  const key = `${selectedSection}::${cat}`;
                  if (isCategoryCollapsed(key)) toggleCategory(key);
                });
              }}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-md hover:bg-zinc-800 transition-all"
            >
              Expand all
            </button>
            <button
              onClick={() => {
                Object.keys(groupedTasks).forEach(cat => {
                  const key = `${selectedSection}::${cat}`;
                  if (!isCategoryCollapsed(key)) toggleCategory(key);
                });
              }}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-md hover:bg-zinc-800 transition-all"
            >
              Collapse all
            </button>
          </div>
        </div>

        {/* ── Task Categories ── */}
        {Object.entries(groupedTasks).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              {completionFilter === 'incomplete' && stats.completed === stats.total ? (
                <>
                  <p className="text-3xl mb-3">🎉</p>
                  <p className="text-zinc-300 text-base font-semibold mb-1">Section complete!</p>
                  <p className="text-zinc-500 text-sm">Every task in this section is done.</p>
                </>
              ) : (
                <>
                  <p className="text-zinc-500 font-medium mb-1">No tasks match your filters</p>
                  <p className="text-zinc-600 text-sm">Try adjusting the filters above</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1">
            {Object.entries(groupedTasks).map(([category, tasks]) => {
              const key = `${selectedSection}::${category}`;
              const collapsed = isCategoryCollapsed(key);

              return (
                <CategoryGroup
                  key={category}
                  category={category}
                  tasks={tasks}
                  state={state}
                  isCollapsed={collapsed}
                  onToggleCollapse={() => toggleCategory(key)}
                  onTaskClick={handleTaskClick}
                  toggleTask={toggleTask}
                  togglePin={togglePin}
                  setTaskStatus={setTaskStatus}
                />
              );
            })}
          </div>
        )}

        {/* ── Summary footer ── */}
        <div className="mt-8 p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Viewing</p>
            <p className="text-sm font-semibold text-white">{getShortSectionName(selectedSection)}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{Object.keys(groupedTasks).length}</div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{filteredTasks.length}</div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-400">{stats.completed}</div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Done</div>
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

function RoadmapLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-zinc-500 text-sm">Loading roadmap...</div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<RoadmapLoading />}>
      <RoadmapContent />
    </Suspense>
  );
}
