'use client';

import { useMemo, useState } from 'react';
import { useApp } from '@/lib/context';
import { sections, tasksBySection, getShortSectionName, getSectionNumber } from '@/data/roadmap';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskPreviewCard } from '@/components/tasks/task-preview-card';
import { TaskDetailDrawer } from '@/components/tasks/task-detail-drawer';
import { cn, getProgressColor } from '@/lib/utils';
import type { Task } from '@/types';
import Link from 'next/link';

/* ─── Types ──────────────────────────────────────────────── */

type BucketType = 'plan' | 'setup' | 'manage' | 'custom';

interface PipelineBucket {
  id: string;
  name: string;
  type: BucketType;
  tasks: Task[];
}

interface SectionPipeline {
  section: string;
  shortName: string;
  number: string;
  buckets: PipelineBucket[];
  stats: {
    total: number;
    completed: number;
    percentage: number;
    blocked: number;
    inProgress: number;
  };
}

/* ─── Bucket Classifier ──────────────────────────────────── */

/**
 * Intelligently classify tasks into Plan/Set Up/Manage buckets
 * based on task content, category, and keywords
 */
function classifyTaskBucket(task: Task): BucketType {
  const taskLower = task.task.toLowerCase();
  const categoryLower = task.category.toLowerCase();
  const combined = `${taskLower} ${categoryLower}`;

  // PLAN indicators: research, strategy, planning, define, decide, identify
  const planKeywords = [
    'research', 'strategy', 'plan', 'define', 'identify', 'evaluate',
    'assess', 'analyze', 'review', 'determine', 'establish framework',
    'scope', 'requirements', 'objectives', 'goals', 'positioning',
    'calibration', 'baseline', 'standards', 'guidelines', 'policy draft'
  ];

  // SETUP indicators: create, build, configure, install, implement, launch
  const setupKeywords = [
    'create', 'build', 'setup', 'configure', 'install', 'implement',
    'develop', 'design', 'write', 'draft', 'prepare', 'produce',
    'purchase', 'procure', 'source', 'order', 'acquire', 'stage',
    'deploy', 'launch', 'activate', 'register', 'upload', 'publish'
  ];

  // MANAGE indicators: maintain, monitor, track, update, optimize
  const manageKeywords = [
    'maintain', 'monitor', 'track', 'update', 'optimize', 'manage',
    'review ongoing', 'conduct', 'perform', 'execute', 'operate',
    'reconcile', 'audit', 'inspect', 'respond', 'handle', 'process',
    'schedule', 'coordinate', 'oversee', 'enforce', 'ensure compliance'
  ];

  // Check timing: Post-Listing usually = Manage
  if (task.timing === 'Post-Listing') {
    return 'manage';
  }

  // Check for Plan keywords
  if (planKeywords.some(kw => combined.includes(kw))) {
    return 'plan';
  }

  // Check for Setup keywords
  if (setupKeywords.some(kw => combined.includes(kw))) {
    return 'setup';
  }

  // Check for Manage keywords
  if (manageKeywords.some(kw => combined.includes(kw))) {
    return 'manage';
  }

  // Default fallback based on timing
  if (task.timing === 'Pre-Listing') return 'setup';
  if (task.timing === 'Ongoing') return 'manage';

  return 'setup'; // neutral default
}

/* ─── Section Pipeline Builder ───────────────────────────── */

function buildSectionPipeline(
  section: string,
  tasks: Task[],
  state: any
): SectionPipeline {
  // Classify tasks into buckets
  const planTasks: Task[] = [];
  const setupTasks: Task[] = [];
  const manageTasks: Task[] = [];

  tasks.forEach(task => {
    const bucket = classifyTaskBucket(task);
    if (bucket === 'plan') planTasks.push(task);
    else if (bucket === 'setup') setupTasks.push(task);
    else if (bucket === 'manage') manageTasks.push(task);
  });

  // Calculate stats
  const total = tasks.length;
  const completed = tasks.filter(t => state.completedIds.includes(t.id)).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const blocked = tasks.filter(t => state.taskMeta[t.id]?.status === 'blocked').length;
  const inProgress = tasks.filter(t => state.taskMeta[t.id]?.status === 'in-progress').length;

  return {
    section,
    shortName: getShortSectionName(section),
    number: getSectionNumber(section),
    buckets: [
      { id: 'plan', name: 'Plan', type: 'plan', tasks: planTasks },
      { id: 'setup', name: 'Set Up', type: 'setup', tasks: setupTasks },
      { id: 'manage', name: 'Manage', type: 'manage', tasks: manageTasks },
    ],
    stats: { total, completed, percentage, blocked, inProgress },
  };
}

/* ─── Components ─────────────────────────────────────────── */

function GlobalMetrics({ pipelines, state }: { pipelines: SectionPipeline[]; state: any }) {
  const metrics = useMemo(() => {
    const allTasks = pipelines.flatMap(p => p.buckets.flatMap(b => b.tasks));
    const planTasks = pipelines.flatMap(p => p.buckets.find(b => b.type === 'plan')?.tasks || []);
    const setupTasks = pipelines.flatMap(p => p.buckets.find(b => b.type === 'setup')?.tasks || []);
    const manageTasks = pipelines.flatMap(p => p.buckets.find(b => b.type === 'manage')?.tasks || []);

    const planCompleted = planTasks.filter(t => state.completedIds.includes(t.id)).length;
    const setupCompleted = setupTasks.filter(t => state.completedIds.includes(t.id)).length;
    const manageCompleted = manageTasks.filter(t => state.completedIds.includes(t.id)).length;

    return {
      plan: { total: planTasks.length, completed: planCompleted, pct: Math.round((planCompleted / planTasks.length) * 100) || 0 },
      setup: { total: setupTasks.length, completed: setupCompleted, pct: Math.round((setupCompleted / setupTasks.length) * 100) || 0 },
      manage: { total: manageTasks.length, completed: manageCompleted, pct: Math.round((manageCompleted / manageTasks.length) * 100) || 0 },
    };
  }, [pipelines, state]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Plan</p>
              <p className="text-2xl font-mono font-extrabold text-blue-400">{metrics.plan.pct}%</p>
              <p className="text-xs text-zinc-600 mt-1">{metrics.plan.completed} of {metrics.plan.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Set Up</p>
              <p className="text-2xl font-mono font-extrabold text-amber-400">{metrics.setup.pct}%</p>
              <p className="text-xs text-zinc-600 mt-1">{metrics.setup.completed} of {metrics.setup.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Manage</p>
              <p className="text-2xl font-mono font-extrabold text-emerald-400">{metrics.manage.pct}%</p>
              <p className="text-xs text-zinc-600 mt-1">{metrics.manage.completed} of {metrics.manage.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionPipelineCard({
  pipeline,
  state,
  isExpanded,
  onToggleExpand,
  onTaskClick,
}: {
  pipeline: SectionPipeline;
  state: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTaskClick: (task: Task) => void;
}) {
  const { toggleTask, setTaskStatus, togglePin } = useApp();

  return (
    <Card className="overflow-hidden border-zinc-800">
      {/* Section Header - Always Visible */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 shrink-0">
            <span className="text-xs font-bold text-zinc-400">{pipeline.number.padStart(2, '0')}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-display font-bold text-white mb-0.5 truncate">
              {pipeline.shortName}
            </h3>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-zinc-500">{pipeline.stats.completed}/{pipeline.stats.total} tasks</span>
              {pipeline.stats.blocked > 0 && (
                <Badge variant="status" status="blocked" className="text-[10px]">
                  {pipeline.stats.blocked} blocked
                </Badge>
              )}
              {pipeline.stats.inProgress > 0 && (
                <Badge variant="status" status="in-progress" className="text-[10px]">
                  {pipeline.stats.inProgress} active
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className={cn('text-xl font-mono font-extrabold', getProgressColor(pipeline.stats.percentage))}>
            {pipeline.stats.percentage}%
          </span>
          <svg
            className={cn('w-5 h-5 text-zinc-500 transition-transform', isExpanded && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable Bucket Content */}
      {isExpanded && (
        <div className="border-t border-zinc-800">
          <div className="p-4 space-y-4">
            {pipeline.buckets.map(bucket => {
              if (bucket.tasks.length === 0) return null;

              const bucketCompleted = bucket.tasks.filter(t => state.completedIds.includes(t.id)).length;
              const bucketPct = Math.round((bucketCompleted / bucket.tasks.length) * 100);

              return (
                <div key={bucket.id} className="space-y-2">
                  {/* Bucket Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          bucket.type === 'plan' && 'bg-blue-400',
                          bucket.type === 'setup' && 'bg-amber-400',
                          bucket.type === 'manage' && 'bg-emerald-400'
                        )}
                      />
                      {bucket.name}
                    </h4>
                    <span className="text-xs text-zinc-600">
                      {bucketCompleted}/{bucket.tasks.length} · {bucketPct}%
                    </span>
                  </div>

                  {/* Task List */}
                  <div className="space-y-2">
                    {bucket.tasks.map(task => {
                      const isCompleted = state.completedIds.includes(task.id);
                      const isPinned = state.pinnedIds.includes(task.id);
                      const status = state.taskMeta[task.id]?.status || 'default';

                      return (
                        <TaskPreviewCard
                          key={task.id}
                          task={task}
                          meta={state.taskMeta[task.id]}
                          isCompleted={isCompleted}
                          isPinned={isPinned}
                          bucket={bucket.type}
                          onToggleComplete={() => toggleTask(task.id)}
                          onTogglePin={() => togglePin(task.id)}
                          onToggleBlocked={() => {
                            if (status === 'blocked') {
                              setTaskStatus(task.id, 'default');
                            } else {
                              setTaskStatus(task.id, 'blocked');
                            }
                          }}
                          onClick={() => onTaskClick(task)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ─── Main Page Component ────────────────────────────────── */

export default function PipelinePage() {
  const { state, isLoaded } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Build pipelines for all sections
  const pipelines = useMemo(() => {
    if (!isLoaded) return [];
    return sections.map(section =>
      buildSectionPipeline(section, tasksBySection[section] || [], state)
    );
  }, [sections, state, isLoaded]);

  // Filter pipelines
  const filteredPipelines = useMemo(() => {
    let result = pipelines;

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter(p => p.stats.inProgress > 0 || p.stats.percentage < 100);
    } else if (statusFilter === 'blocked') {
      result = result.filter(p => p.stats.blocked > 0);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.shortName.toLowerCase().includes(term) ||
        p.buckets.some(b => b.tasks.some(t => t.task.toLowerCase().includes(term)))
      );
    }

    return result;
  }, [pipelines, statusFilter, searchTerm]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(sections));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  if (!isLoaded) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/4" />
          <div className="h-20 bg-zinc-800 rounded" />
          <div className="h-40 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight mb-2">
              Pipeline
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl">
              Organized operational view across Plan, Set Up, and Manage phases. All work categorized by execution stage for clear scanning and prioritization.
            </p>
          </div>
          <Link
            href="/roadmap"
            className="shrink-0 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors flex items-center gap-2"
          >
            <span>View Roadmap</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Global Metrics */}
        <GlobalMetrics pipelines={pipelines} state={state} />
      </header>

      {/* Filters & Controls */}
      <div className="sticky top-0 z-20 bg-zinc-950 pb-4 mb-4 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search sections or tasks..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status filters */}
          <div className="flex gap-2">
            {(['all', 'active', 'blocked'] as const).map(filter => (
              <Button
                key={filter}
                variant={statusFilter === filter ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(filter)}
              >
                {filter === 'all' ? 'All' : filter === 'active' ? 'Active' : 'Blocked'}
              </Button>
            ))}
          </div>

          {/* Expand/Collapse */}
          <div className="flex gap-1.5">
            <button
              onClick={expandAll}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-2 rounded-md hover:bg-zinc-800 transition-all"
            >
              Expand all
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-2 rounded-md hover:bg-zinc-800 transition-all"
            >
              Collapse all
            </button>
          </div>
        </div>
      </div>

      {/* Section Pipeline Cards */}
      <div className="space-y-3">
        {filteredPipelines.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500">No sections match your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredPipelines.map(pipeline => (
            <SectionPipelineCard
              key={pipeline.section}
              pipeline={pipeline}
              state={state}
              isExpanded={expandedSections.has(pipeline.section)}
              onToggleExpand={() => toggleSection(pipeline.section)}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          ))
        )}
      </div>

      {/* Footer note */}
      <footer className="mt-8 pt-6 border-t border-zinc-800 text-center">
        <p className="text-xs text-zinc-600">
          Tasks automatically categorized into Plan → Set Up → Manage based on execution phase
        </p>
      </footer>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
