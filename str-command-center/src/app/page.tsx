'use client';

import { useApp } from '@/lib/context';
import { 
  getOverallStats, 
  getPreListingStats, 
  getDocumentationStats, 
  getSectionSummaries,
  getBlockedTasks,
  getInProgressTasks,
  getRecentlyCompleted,
  getDaysUntilLaunch,
} from '@/lib/selectors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn, getProgressColor } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { state, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const overallStats = getOverallStats(state);
  const preListingStats = getPreListingStats(state);
  const docStats = getDocumentationStats(state);
  const sectionSummaries = getSectionSummaries(state);
  const blockedTasks = getBlockedTasks(state);
  const inProgressTasks = getInProgressTasks(state);
  const recentTasks = getRecentlyCompleted(state, 5);
  const daysUntilLaunch = getDaysUntilLaunch(state.launchDate);

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
          Global Overview
        </h1>
        <p className="text-slate-400 text-lg">
          Cross-system launch progress & readiness score
        </p>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
              Completion
            </p>
            <p className={cn('text-3xl font-bold', getProgressColor(overallStats.percentage))}>
              {overallStats.percentage}%
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {overallStats.completed} / {overallStats.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
              Pre-Launch Ready
            </p>
            <p className={cn('text-3xl font-bold', getProgressColor(preListingStats.percentage))}>
              {preListingStats.percentage}%
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {preListingStats.remaining} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
              Documents
            </p>
            <p className={cn('text-3xl font-bold', getProgressColor(docStats.percentage))}>
              {docStats.percentage}%
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {docStats.completed} / {docStats.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
              Launch In
            </p>
            <p className="text-3xl font-bold text-purple-400">
              {daysUntilLaunch}
            </p>
            <p className="text-xs text-slate-600 mt-1">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Bar */}
      <Card className="mb-8">
        <CardContent className="py-5">
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-slate-400 font-medium">Overall Launch Progress</span>
            <span className="text-slate-300 font-semibold">
              {overallStats.completed} / {overallStats.total} Tasks
            </span>
          </div>
          <ProgressBar value={overallStats.percentage} size="lg" />
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Attention Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-amber-400">⚡</span>
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockedTasks.length === 0 && inProgressTasks.length === 0 ? (
              <p className="text-slate-500 text-sm">No blockers or active items</p>
            ) : (
              <>
                {blockedTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                    <Badge variant="status" status="blocked">Blocked</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{task.task}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{task.section.replace(' Master Checklist', '')}</p>
                    </div>
                  </div>
                ))}
                {inProgressTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                    <Badge variant="status" status="in-progress">Active</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{task.task}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{task.section.replace(' Master Checklist', '')}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
            <Link href="/focus" className="block text-center text-sm text-indigo-400 hover:text-indigo-300 pt-2">
              View all focus items →
            </Link>
          </CardContent>
        </Card>

        {/* Recently Completed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              Recently Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-slate-500 text-sm">No completed tasks yet</p>
            ) : (
              recentTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{task.task}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{task.section.replace(' Master Checklist', '')}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section Progress Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Section Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionSummaries.map((section, idx) => (
              <Link
                key={section.name}
                href={`/roadmap?section=${encodeURIComponent(section.name)}`}
                className="block p-4 bg-bg-surface rounded-xl border border-border-dark hover:border-border-light transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded bg-white/5 text-xs font-bold text-slate-500">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium text-white truncate">
                      {section.shortName}
                    </span>
                  </div>
                  <span className={cn('text-sm font-bold', getProgressColor(section.percentage))}>
                    {section.percentage}%
                  </span>
                </div>
                <ProgressBar value={section.percentage} size="sm" />
                <div className="flex justify-between mt-2 text-[10px] text-slate-500">
                  <span>{section.completed} / {section.total} tasks</span>
                  {section.blockedCount > 0 && (
                    <span className="text-red-400">{section.blockedCount} blocked</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-border-dark flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest">
        <span>7513 Ballydawn Dr • Austin TX</span>
        <span>STR Command Center v2.0 • 2026</span>
      </footer>
    </div>
  );
}
