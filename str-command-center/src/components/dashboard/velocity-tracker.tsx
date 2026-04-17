'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { AppState } from '@/types';

interface VelocityTrackerProps {
  state: AppState;
  totalTasks: number;
  completedTasks: number;
  launchDate: string;
}

function getVelocityStats(state: AppState, days: number = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  let completedInPeriod = 0;
  
  Object.values(state.taskMeta).forEach((meta) => {
    if (meta.completedAt) {
      const completedDate = new Date(meta.completedAt);
      if (completedDate >= cutoffDate) {
        completedInPeriod++;
      }
    }
  });
  
  return {
    completedInPeriod,
    averagePerDay: completedInPeriod / days,
    averagePerWeek: (completedInPeriod / days) * 7,
  };
}

export function VelocityTracker({ state, totalTasks, completedTasks, launchDate }: VelocityTrackerProps) {
  const stats = useMemo(() => {
    const remaining = totalTasks - completedTasks;
    const velocity = getVelocityStats(state, 7);
    
    const daysUntilLaunch = Math.ceil(
      (new Date(launchDate).getTime() - Date.now()) / 86400000
    );
    
    const daysToComplete = velocity.averagePerDay > 0 
      ? Math.ceil(remaining / velocity.averagePerDay) 
      : Infinity;
    
    const projectedCompletion = new Date();
    projectedCompletion.setDate(projectedCompletion.getDate() + daysToComplete);
    
    const onTrack = daysToComplete <= daysUntilLaunch;
    
    return {
      remaining,
      velocity: velocity.averagePerWeek,
      daysToComplete,
      daysUntilLaunch,
      projectedCompletion,
      onTrack,
    };
  }, [state, totalTasks, completedTasks, launchDate]);

  const progress = (completedTasks / totalTasks) * 100;
  
  return (
    <div className="glass rounded-2xl border-2 border-zinc-800 overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white">Velocity & Burndown</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Track your momentum</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Burndown Progress */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm font-medium text-zinc-400">Tasks Remaining</span>
            <div className="text-right">
              <span className="text-3xl font-mono font-bold text-white">{stats.remaining}</span>
              <span className="text-sm text-zinc-500 ml-2">of {totalTasks}</span>
            </div>
          </div>
          
          <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                progress >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                progress >= 50 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                'bg-gradient-to-r from-amber-500 to-amber-400'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>0%</span>
            <span className="font-mono">{progress.toFixed(1)}% Complete</span>
            <span>100%</span>
          </div>
        </div>

        {/* Velocity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="text-xs text-zinc-500 uppercase tracking-wide font-bold mb-2">Velocity (7d)</div>
            <div className="text-2xl font-mono font-extrabold text-blue-400">
              {stats.velocity.toFixed(1)}
              <span className="text-sm text-zinc-500 ml-1">tasks/wk</span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="text-xs text-zinc-500 uppercase tracking-wide font-bold mb-2">Time to Complete</div>
            <div className={cn(
              "text-2xl font-mono font-extrabold",
              stats.daysToComplete === Infinity ? 'text-zinc-500' :
              stats.daysToComplete > stats.daysUntilLaunch ? 'text-red-400' :
              'text-emerald-400'
            )}>
              {stats.daysToComplete === Infinity ? '—' : stats.daysToComplete}
              <span className="text-sm text-zinc-500 ml-1">days</span>
            </div>
          </div>
        </div>

        {/* Projection */}
        <div className={cn(
          'p-4 rounded-xl border-2',
          stats.onTrack 
            ? 'bg-emerald-500/5 border-emerald-500/30' 
            : 'bg-red-500/5 border-red-500/30'
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
              stats.onTrack ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            )}>
              {stats.onTrack ? '✓' : '⚠'}
            </div>
            <div className="flex-1">
              <div className={cn(
                'text-sm font-semibold mb-1',
                stats.onTrack ? 'text-emerald-400' : 'text-red-400'
              )}>
                {stats.onTrack 
                  ? `On Track for Launch (${stats.daysUntilLaunch} days)` 
                  : `Behind Schedule`}
              </div>
              <div className="text-xs text-zinc-400">
                {stats.daysToComplete === Infinity ? (
                  'No recent completions to project timeline'
                ) : (
                  <>
                    Projected completion: <span className="font-mono">{stats.projectedCompletion.toLocaleDateString()}</span>
                    {!stats.onTrack && (
                      <span className="text-red-400 ml-2">
                        ({Math.abs(stats.daysToComplete - stats.daysUntilLaunch)} days past launch)
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
