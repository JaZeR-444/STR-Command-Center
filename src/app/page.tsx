'use client';

import { useApp } from '@/lib/context';
import {
  getOverallStats,
  getPreListingStats,
  getDocumentationStats,
  getSectionSummaries,
  getBlockedTasks,
  getCriticalPathTasks,
  getDaysUntilLaunch,
  getPinnedTasks,
  getRecentlyCompleted,
} from '@/lib/selectors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton';
import { CommandStation } from '@/components/dashboard/command-station';
import { VelocityTracker } from '@/components/dashboard/velocity-tracker';
import { OperationsOverview } from '@/components/dashboard/operations-overview';
import { cn, getProgressColor } from '@/lib/utils';
import Link from 'next/link';

/* ─── helpers ─────────────────────────────────────────── */

function timeAgo(iso: string | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getLaunchRunway(launchDate: string) {
  // We define the "start" as the app's default origin = 2026-04-03 (first use)
  const start = new Date('2026-04-03');
  const end   = new Date(launchDate);
  const now   = new Date();
  const totalMs   = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();
  const elapsed   = Math.max(0, Math.floor(elapsedMs / 86_400_000));
  const total     = Math.max(1, Math.floor(totalMs   / 86_400_000));
  const pct       = Math.min(100, Math.round((elapsed / total) * 100));
  return { elapsed, total, pct };
}

function getMomentumStats(state: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: { date: Date, dateStr: string, count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      date: d,
      dateStr: d.toISOString().split('T')[0],
      count: 0
    });
  }

  if (state && state.taskMeta) {
    Object.values(state.taskMeta).forEach((meta: any) => {
      if (meta.completedAt) {
        const dStr = meta.completedAt.split('T')[0];
        const match = days.find(d => d.dateStr === dStr);
        if (match) match.count++;
      }
    });
  }
  return days;
}

/* ─── sub-components ──────────────────────────────────── */

function StatKPI({
  value,
  label,
  sub,
  color,
  href,
  pulse,
}: {
  value: string | number;
  label: string;
  sub?: string;
  color?: string;
  href?: string;
  pulse?: boolean;
}) {
  const inner = (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-6 px-4 text-center h-full rounded-xl border-2 transition-all duration-200 glass',
        href && 'hover:scale-[1.025] hover:border-zinc-600 cursor-pointer hover:shadow-medium',
        pulse && 'animate-glow',
        'border-zinc-800'
      )}
    >
      <span className={cn('text-4xl lg:text-5xl font-mono font-extrabold tabular-nums leading-none', color ?? 'text-white')}>
        {value}
      </span>
      <span className="mt-3 text-[11px] text-zinc-400 uppercase tracking-widest font-bold">{label}</span>
      {sub && <span className="mt-1.5 text-[10px] text-zinc-600 font-medium">{sub}</span>}
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}

function MomentumHeatmap({ data }: { data: { date: Date, dateStr: string, count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1); 
  const totalCompleted = data.reduce((sum, d) => sum + d.count, 0);
  
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-end gap-1 h-[40px]">
        {data.map((day, i) => {
          let bg = 'bg-zinc-800/40';
          let border = 'border-zinc-800/50';
          let h = 8;
          if (day.count > 0) {
            h = Math.max(12, (day.count / maxCount) * 40);
            const intensity = day.count / maxCount;
            if (intensity > 0.66) { bg = 'bg-blue-500'; border = 'border-blue-400'; }
            else if (intensity > 0.33) { bg = 'bg-blue-500/70'; border = 'border-blue-400/70'; }
            else { bg = 'bg-blue-500/40'; border = 'border-blue-400/40'; }
          }
          
          return (
            <div 
              key={i} 
              title={`${day.dateStr}: ${day.count} tasks`}
              className={cn("w-[14px] rounded-[3px] border transition-all hover:scale-110", bg, border)}
              style={{ height: `${h}px` }}
            />
          );
        })}
      </div>
      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{totalCompleted} Wins (14D)</span>
    </div>
  );
}

function SectionCard({ idx, section }: {
  idx: number;
  section: { name: string; shortName: string; percentage: number; completed: number; total: number; blockedCount: number };
}) {
  return (
    <Link href={`/roadmap?section=${encodeURIComponent(section.name)}`} className="block group">
      <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-150 group-hover:bg-zinc-900">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 text-[9px] font-bold text-zinc-500 shrink-0">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-zinc-200 truncate">{section.shortName}</span>
          </div>
          <span className={cn('text-xs font-bold shrink-0 ml-2', getProgressColor(section.percentage))}>
            {section.percentage}%
          </span>
        </div>
        <ProgressBar value={section.percentage} size="sm" />
        <div className="flex justify-between items-center mt-1.5 text-[10px] text-zinc-600">
          <span>{section.completed}/{section.total}</span>
          {section.blockedCount > 0 && (
            <span className="text-red-400 font-semibold">{section.blockedCount} blocked</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── main dashboard ──────────────────────────────────── */

export default function DashboardPage() {
  const { state, isLoaded, togglePin } = useApp();

  if (!isLoaded) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const overallStats     = getOverallStats(state);
  const preListingStats  = getPreListingStats(state);
  const docStats         = getDocumentationStats(state);
  const sectionSummaries = getSectionSummaries(state);
  const blockedTasks     = getBlockedTasks(state);
  const criticalPath     = getCriticalPathTasks(state, 4);
  const pinnedTasks      = getPinnedTasks(state);
  const recentlyDone     = getRecentlyCompleted(state, 6);
  const daysUntilLaunch  = getDaysUntilLaunch(state.launchDate);
  const runway           = getLaunchRunway(state.launchDate);

  const isLaunchUrgent = daysUntilLaunch <= 7 && daysUntilLaunch > 0;
  const isLaunched     = daysUntilLaunch === 0;

  const launchDateFormatted = new Date(state.launchDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-12 gap-6">

      {/* ── Page header (FULL WIDTH) ── */}
      <header className="col-span-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="section-eyebrow mb-2">Operations Command</p>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold text-white leading-[0.95]">
            Mission Control
          </h1>
          <p className="text-zinc-400 text-sm mt-2 max-w-2xl">Austin STR launch workspace for 7513 Ballydawn Dr, designed around operational clarity, execution rhythm, and launch readiness.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full premium-pill self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-zinc-300 font-medium uppercase tracking-[0.22em]">Live Sync Active</span>
        </div>
      </header>

      {/* ── Operations Overview (shows when operational data exists) ── */}
      <OperationsOverview state={state} />

      {/* ── PHASE 3: Command Station - Next Actions (HERO CARD) ── */}
      <section className="col-span-full">
        <CommandStation state={state} daysUntilLaunch={daysUntilLaunch} />
      </section>

      {/* ── PHASE 3: Velocity & Burndown Tracker ── */}
      <section className="col-span-full lg:col-span-8 xl:col-span-7">
        <VelocityTracker
          state={state}
          totalTasks={overallStats.total}
          completedTasks={overallStats.completed}
          launchDate={state.launchDate}
        />
      </section>
        
      {/* Momentum Heatmap - Companion card */}
      <section className="col-span-full lg:col-span-4 xl:col-span-5">
        <div className="glass rounded-2xl border-2 border-zinc-800 px-6 py-5 h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl premium-pill flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="section-eyebrow mb-1">Execution Rhythm</p>
              <h3 className="text-2xl font-display font-semibold text-white">Momentum</h3>
              <p className="text-xs text-zinc-400 mt-0.5">14-day completion cadence</p>
            </div>
          </div>
          <div className="flex justify-center">
            <MomentumHeatmap data={getMomentumStats(state)} />
          </div>
        </div>
      </section>

      {/* ── KPI Stats Grid (SMALLER) ── */}
      <section
        className="col-span-full grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
      >
        {/* Progress ring */}
        <div className="md:col-span-2 xl:col-span-1 xl:row-span-2">
          <div className="h-full glass rounded-xl border border-blue-500/20 shadow-medium flex flex-col items-center justify-center py-8 px-4">
            <ProgressRing value={overallStats.percentage} size="xl" label="COMPLETE" />
            <div className="mt-5 text-center">
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.24em] font-semibold mb-1">Overall Launch Progress</p>
              <p className="text-zinc-400 text-base font-semibold">
                {overallStats.completed} <span className="text-zinc-600">/ {overallStats.total} tasks</span>
              </p>
            </div>
          </div>
        </div>

        {/* Blocked */}
        <StatKPI
          href="/focus"
          value={blockedTasks.length}
          label="Blocked Items"
          sub={blockedTasks.length > 0 ? 'Needs attention' : 'All clear ✓'}
          color={blockedTasks.length > 0 ? 'text-red-400' : 'text-emerald-400'}
        />

        {/* Days to launch */}
        <StatKPI
          value={daysUntilLaunch}
          label="Days to Launch"
          sub={isLaunchUrgent ? '🔥 Final sprint' : isLaunched ? '🚀 Launch day!' : launchDateFormatted}
          color={isLaunchUrgent ? 'text-amber-400' : isLaunched ? 'text-emerald-400' : 'text-blue-400'}
          pulse={isLaunchUrgent}
        />

        {/* Pre-listing */}
        <StatKPI
          value={`${preListingStats.percentage}%`}
          label="Pre-Listing"
          sub={`${preListingStats.remaining} remaining`}
          color={getProgressColor(preListingStats.percentage)}
        />

        {/* Documentation */}
        <StatKPI
          value={`${docStats.percentage}%`}
          label="Documentation"
          sub={`${docStats.completed} / ${docStats.total} artifacts`}
          color={getProgressColor(docStats.percentage)}
        />
      </section>

      {/* ── #1 HIGH IMPACT: Launch Runway Bar ── */}
      <section className="col-span-full">
        <div className={cn(
          'rounded-xl border px-4 py-3',
          isLaunchUrgent
            ? 'bg-amber-500/8 border-amber-500/25'
            : 'bg-zinc-900/50 border-zinc-800'
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-200">Launch Runway</span>
              {isLaunchUrgent && (
                <span className="px-2 py-1 text-[9px] font-bold bg-amber-500/20 text-amber-200 rounded-full uppercase tracking-[0.2em]">
                  Final Sprint
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span>Day {runway.elapsed} of {runway.total}</span>
              <span className="text-zinc-700">·</span>
              <span className={cn('font-semibold', isLaunchUrgent ? 'text-amber-400' : 'text-blue-400')}>
                Target: {launchDateFormatted}
              </span>
            </div>
          </div>
          {/* Runway progress bar */}
          <div className="relative h-2.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                runway.pct >= 90
                  ? 'bg-gradient-to-r from-red-500 to-amber-500'
                  : runway.pct >= 66
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-400'
              )}
              style={{ width: `${runway.pct}%` }}
            />
            {/* Today marker */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-white/60 rounded"
              style={{ left: `${runway.pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-zinc-700 uppercase tracking-wider">
            <span>Start</span>
            <span>{runway.pct}% of runway used · {daysUntilLaunch}d remaining</span>
            <span>Launch</span>
          </div>
        </div>
      </section>

      {/* ── #2 Launch Velocity Visualization ── */}
      <section className="col-span-full">
        <div className="rounded-xl border bg-zinc-900/50 border-zinc-800 px-4 py-3 flex items-center justify-between shadow-inner">
          <div>
            <h3 className="text-sm font-display font-bold text-zinc-200">Velocity Heatmap</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-widest font-semibold">Task completion momentum</p>
          </div>
          <MomentumHeatmap data={getMomentumStats(state)} />
        </div>
      </section>

      {/* ── #1 HIGH IMPACT: Pinned Tasks ── */}
      <section className="col-span-full">
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
            <span className="section-eyebrow !text-[10px] !tracking-[0.2em]">Focus</span> Pinned Tasks
            {pinnedTasks.length > 0 && (
              <span className="text-[10px] font-normal text-zinc-600">({pinnedTasks.length})</span>
            )}
          </h2>
          <Link href="/roadmap" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-1">
            Pin from Roadmap
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {pinnedTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 py-6 text-center">
            <p className="text-sm text-zinc-500 font-medium">No pinned tasks yet</p>
            <p className="text-xs text-zinc-700 mt-1">
              Open any task in the{' '}
              <Link href="/roadmap" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                Roadmap
              </Link>{' '}
              and pin it to see it here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {pinnedTasks.map((task) => {
              const status = state.taskMeta[task.id]?.status || 'default';
              const isCompleted = state.completedIds.includes(task.id);
              const note = state.taskMeta[task.id]?.note;
              return (
                <div
                  key={task.id}
                  className={cn(
                    'relative flex flex-col gap-2 p-3 rounded-xl border transition-all duration-150',
                    isCompleted
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : status === 'blocked'
                      ? 'bg-red-500/8 border-red-500/25'
                      : status === 'in-progress'
                      ? 'bg-blue-500/8 border-blue-500/20'
                      : 'bg-zinc-900/60 border-zinc-800'
                  )}
                >
                  {/* Unpin button */}
                  <button
                    onClick={() => togglePin(task.id)}
                    className="absolute top-2 right-2 text-zinc-700 hover:text-amber-400 transition-colors duration-200"
                    title="Unpin task"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 3a1 1 0 011 1v1l-2 4 1 1h3a1 1 0 010 2h-1l-1 1-1 5H8l-1-5-1-1H5a1 1 0 010-2h3l1-1-2-4V4a1 1 0 011-1h8zm-4 13a1 1 0 100 2 1 1 0 000-2z" />
                    </svg>
                  </button>

                  <div className="pr-5">
                    <p className={cn(
                      'text-sm font-medium leading-snug',
                      isCompleted ? 'line-through text-zinc-500' : 'text-zinc-200'
                    )}>
                      {task.task}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {task.section.replace(' Master Checklist', '')} · {task.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isCompleted ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/15 text-emerald-400 rounded-full uppercase tracking-wider">
                          Done ✓
                        </span>
                      ) : (
                        <Badge variant="status" status={status === 'blocked' ? 'blocked' : status === 'in-progress' ? 'in-progress' : 'default'}>
                          {status === 'blocked' ? 'Blocked' : status === 'in-progress' ? 'In Progress' : task.timing}
                        </Badge>
                      )}
                    </div>
                    <Link
                      href={`/roadmap?section=${encodeURIComponent(task.section)}`}
                      className="text-[10px] text-zinc-600 hover:text-blue-400 transition-colors duration-200"
                    >
                      View →
                    </Link>
                  </div>

                  {note && (
                    <p className="text-[10px] text-zinc-500 bg-zinc-800/60 rounded-md px-2 py-1.5 italic leading-snug border-l-2 border-zinc-700">
                      {note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Critical path + Win feed side-by-side ── */}
      <section className="col-span-full grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Critical Path — 3/5 cols */}
        <div className="xl:col-span-3">
          <Card className="h-full bg-amber-500/5 border-amber-500/20">
            <CardHeader className="py-3 px-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                Critical Path — Next Actions
                <span className="ml-auto text-[10px] font-normal text-zinc-600">{criticalPath.length} active</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {criticalPath.length === 0 ? (
                <p className="text-zinc-500 text-sm py-6 text-center">No critical tasks — keep the momentum going!</p>
              ) : (
                criticalPath.map((task) => {
                  const status = state.taskMeta[task.id]?.status || 'default';
                  return (
                    <Link key={task.id} href={`/roadmap?section=${encodeURIComponent(task.section)}`} className="block group">
                      <div className={cn(
                        'flex items-start gap-2.5 p-3 rounded-lg border transition-all duration-150 group-hover:translate-x-0.5',
                        status === 'blocked'
                          ? 'bg-red-500/8 border-red-500/25 hover:border-red-500/45'
                          : 'bg-amber-500/8 border-amber-500/18 hover:border-amber-500/35'
                      )}>
                        <Badge variant="status" status={status === 'blocked' ? 'blocked' : 'in-progress'}>
                          {status === 'blocked' ? 'Blocked' : 'Active'}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-200 font-medium mb-0.5 leading-snug">{task.task}</p>
                          <p className="text-[10px] text-zinc-600">
                            {task.section.replace(' Master Checklist', '')} · {task.category}
                          </p>
                        </div>
                        <svg className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  );
                })
              )}
              <Link href="/focus" className="flex items-center justify-center gap-1 text-xs text-blue-400 hover:text-blue-300 pt-2 transition-colors duration-200">
                View all focus items
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* #2 HIGH IMPACT: Recently Completed Win Feed — 2/5 cols */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <Card className="flex-1 bg-zinc-900/60 border-zinc-800">
            <CardHeader className="py-3 px-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                Recent Wins
                {recentlyDone.length > 0 && (
                  <span className="ml-auto text-[10px] font-normal text-zinc-600">
                    {overallStats.completed} total
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {recentlyDone.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-zinc-500 font-medium">No completions yet</p>
                  <p className="text-xs text-zinc-700 mt-1">Complete your first task to start building momentum</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {recentlyDone.map((task, i) => {
                    const completedAt = state.taskMeta[task.id]?.completedAt;
                    return (
                      <li key={task.id}>
                        <Link
                          href={`/roadmap?section=${encodeURIComponent(task.section)}`}
                          className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors duration-200 group"
                        >
                          {/* Staggered glow dot */}
                          <span className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5',
                            i === 0
                              ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-500'
                          )}>
                            ✓
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-zinc-300 font-medium leading-snug truncate group-hover:text-white transition-colors">
                              {task.task}
                            </p>
                            <p className="text-[10px] text-zinc-600 mt-0.5 flex items-center gap-1">
                              <span className="truncate">{task.section.replace(' Master Checklist', '')}</span>
                              {completedAt && (
                                <>
                                  <span className="text-zinc-700">·</span>
                                  <span className="shrink-0 text-zinc-600">{timeAgo(completedAt)}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </Link>
                        {i < recentlyDone.length - 1 && (
                          <div className="ml-6 border-b border-zinc-800/60" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Section progress grid ── */}
      <section className="col-span-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-display font-bold text-zinc-300 flex items-center gap-2">
            Section Progress
          </h2>
          <Link
            href="/roadmap"
            className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-1"
          >
            Full roadmap
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {sectionSummaries.map((section, idx) => (
            <SectionCard key={section.name} idx={idx} section={section} />
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="col-span-full pb-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-zinc-700 uppercase tracking-[0.22em] border-t border-zinc-800/60 pt-4">
        <span>7513 Ballydawn Dr · Austin TX</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          STR Operations Command · 2026
        </span>
      </footer>

      </div> {/* End grid container */}
    </div>
  );
}
