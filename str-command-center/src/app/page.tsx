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
} from '@/lib/selectors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress';
import { ProgressRing } from '@/components/progress-ring';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton';
import { cn, getProgressColor } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { state, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const overallStats = getOverallStats(state);
  const preListingStats = getPreListingStats(state);
  const docStats = getDocumentationStats(state);
  const sectionSummaries = getSectionSummaries(state);
  const blockedTasks = getBlockedTasks(state);
  const criticalPath = getCriticalPathTasks(state, 3);
  const daysUntilLaunch = getDaysUntilLaunch(state.launchDate);

  const isLaunchUrgent = daysUntilLaunch <= 7 && daysUntilLaunch > 0;

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          Mission Control
        </h1>
        <p className="text-zinc-400 text-lg">
          Austin STR operational readiness dashboard
        </p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Overall Progress - Large Feature */}
        <Card className="md:col-span-2 lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="flex flex-col items-center justify-center h-full py-12">
            <ProgressRing value={overallStats.percentage} size="xl" label="COMPLETE" />
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                Overall Launch Progress
              </p>
              <p className="text-zinc-500 text-lg font-medium">
                {overallStats.completed} / {overallStats.total} Tasks
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Blocked Items - High Visibility */}
        <Link
          href="/focus"
          className="block group"
        >
          <Card className={cn(
            'h-full transition-all hover:scale-[1.02]',
            blockedTasks.length > 0 
              ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50' 
              : 'bg-zinc-900 border-zinc-800'
          )}>
            <CardContent className="py-8 text-center">
              <div className={cn(
                'text-6xl font-bold mb-2',
                blockedTasks.length > 0 ? 'text-red-400' : 'text-emerald-400'
              )}>
                {blockedTasks.length}
              </div>
              <p className="text-sm text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                Blocked Items
              </p>
              <p className="text-xs text-zinc-600">
                {blockedTasks.length > 0 ? 'Needs immediate attention' : 'All systems clear'}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Launch Countdown */}
        <Card className={cn(
          'transition-all',
          isLaunchUrgent && 'bg-amber-500/10 border-amber-500/30 animate-pulse-slow'
        )}>
          <CardContent className="py-8 text-center">
            <div className={cn(
              'text-6xl font-bold mb-2',
              isLaunchUrgent ? 'text-amber-400' : daysUntilLaunch === 0 ? 'text-emerald-400' : 'text-blue-400'
            )}>
              {daysUntilLaunch}
            </div>
            <p className="text-sm text-zinc-400 uppercase tracking-wider font-semibold mb-1">
              Days to Launch
            </p>
            <p className="text-xs text-zinc-600">
              {isLaunchUrgent ? 'Final sprint mode' : daysUntilLaunch === 0 ? 'Launch day!' : 'Target date'}
            </p>
          </CardContent>
        </Card>

        {/* Pre-Listing Readiness */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-8 text-center">
            <div className={cn('text-5xl font-bold mb-2', getProgressColor(preListingStats.percentage))}>
              {preListingStats.percentage}%
            </div>
            <p className="text-sm text-zinc-400 uppercase tracking-wider font-semibold mb-1">
              Pre-Listing Ready
            </p>
            <p className="text-xs text-zinc-600">
              {preListingStats.remaining} tasks remaining
            </p>
          </CardContent>
        </Card>

        {/* Documentation Status */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-8 text-center">
            <div className={cn('text-5xl font-bold mb-2', getProgressColor(docStats.percentage))}>
              {docStats.percentage}%
            </div>
            <p className="text-sm text-zinc-400 uppercase tracking-wider font-semibold mb-1">
              Documentation
            </p>
            <p className="text-xs text-zinc-600">
              {docStats.completed} / {docStats.total} artifacts
            </p>
          </CardContent>
        </Card>

        {/* Critical Path - Feature Priority */}
        <Card className="md:col-span-2 bg-amber-500/5 border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-amber-400">⚡</span>
              Critical Path — Next Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalPath.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4 text-center">
                No critical tasks — keep momentum going!
              </p>
            ) : (
              criticalPath.map((task) => {
                const status = state.taskMeta[task.id]?.status || 'default';
                return (
                  <Link
                    key={task.id}
                    href={`/roadmap?section=${encodeURIComponent(task.section)}`}
                    className="block group"
                  >
                    <div className={cn(
                      'flex items-start gap-3 p-4 rounded-lg border transition-all group-hover:scale-[1.01]',
                      status === 'blocked' 
                        ? 'bg-red-500/10 border-red-500/30 group-hover:border-red-500/50' 
                        : 'bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40'
                    )}>
                      <Badge 
                        variant="status" 
                        status={status === 'blocked' ? 'blocked' : 'in-progress'}
                      >
                        {status === 'blocked' ? 'Blocked' : 'In Progress'}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 font-medium mb-1">{task.task}</p>
                        <p className="text-xs text-zinc-500">
                          {task.section.replace(' Master Checklist', '')} · {task.category}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })
            )}
            <Link 
              href="/focus" 
              className="block text-center text-sm text-blue-400 hover:text-blue-300 pt-2 transition-colors"
            >
              View all focus items →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Section Progress Grid */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Section Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionSummaries.map((section, idx) => (
              <Link
                key={section.name}
                href={`/roadmap?section=${encodeURIComponent(section.name)}`}
                className="block group"
              >
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group-hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-500">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-semibold text-white truncate">
                        {section.shortName}
                      </span>
                    </div>
                    <span className={cn('text-sm font-bold', getProgressColor(section.percentage))}>
                      {section.percentage}%
                    </span>
                  </div>
                  <ProgressBar value={section.percentage} size="sm" />
                  <div className="flex justify-between items-center mt-3 text-xs text-zinc-500">
                    <span>{section.completed} / {section.total}</span>
                    {section.blockedCount > 0 && (
                      <span className="text-red-400 font-semibold">
                        {section.blockedCount} blocked
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-zinc-600 uppercase tracking-widest">
        <span>7513 Ballydawn Dr • Austin TX</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          STR Command Center v2.1 • 2026
        </span>
      </footer>
    </div>
  );
}
