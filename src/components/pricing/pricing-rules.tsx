'use client';

import { cn } from '@/lib/utils';
import type { PricingRule } from '@/types';

const strategyColors = {
  base: 'text-zinc-400',
  weekend: 'text-blue-400',
  event: 'text-purple-400',
  orphan_gap: 'text-amber-400',
  last_minute: 'text-emerald-400',
  seasonal: 'text-pink-400',
  custom: 'text-zinc-400',
};

export function PricingRules({
  rules,
  onToggle,
}: {
  rules: PricingRule[];
  onToggle?: (ruleId: string, enabled: boolean) => void;
}) {
  // Sort by priority (lower = higher priority)
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-white">Pricing Rules</h3>
        <span className="text-sm text-zinc-500">{rules.filter(r => r.enabled).length} active</span>
      </div>

      {sortedRules.length === 0 ? (
        <div className="glass rounded-xl border-2 border-zinc-800 p-8 text-center">
          <p className="text-zinc-400">No pricing rules configured</p>
        </div>
      ) : (
        sortedRules.map(rule => (
          <div
            key={rule.id}
            className={cn(
              'glass rounded-xl border-2 p-4 transition-all',
              rule.enabled ? 'border-zinc-800' : 'border-zinc-800/50 opacity-50'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* Name and toggle */}
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => onToggle?.(rule.id, !rule.enabled)}
                    className={cn(
                      'w-11 h-6 rounded-full transition-all relative',
                      rule.enabled ? 'bg-blue-500' : 'bg-zinc-700'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm',
                        rule.enabled ? 'left-5' : 'left-0.5'
                      )}
                    />
                  </button>
                  <h4 className="text-base font-semibold text-white">{rule.name}</h4>
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded capitalize',
                    strategyColors[rule.strategy]
                  )}>
                    {rule.strategy.replace('_', ' ')}
                  </span>
                </div>

                {/* Description */}
                {rule.description && (
                  <p className="text-sm text-zinc-400 mb-3">{rule.description}</p>
                )}

                {/* Details */}
                <div className="flex flex-wrap gap-4 text-xs">
                  {/* Date range */}
                  {rule.startDate && rule.endDate && (
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <path d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                      {new Date(rule.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' - '}
                      {new Date(rule.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}

                  {/* Recurring */}
                  {rule.recurring && (
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      {rule.recurring.replace('_', ' ')}
                    </div>
                  )}

                  {/* Adjustment */}
                  <div className={cn(
                    'flex items-center gap-1.5 font-semibold',
                    rule.priceAdjustment > 0 ? 'text-emerald-400' : 'text-amber-400'
                  )}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {rule.priceAdjustment > 0 ? '+' : ''}{rule.priceAdjustment}{rule.adjustmentType === 'percentage' ? '%' : ' flat'}
                  </div>

                  {/* Min/Max stay */}
                  {rule.minStay && (
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg>
                      {rule.minStay}n min
                      {rule.maxStay && ` / ${rule.maxStay}n max`}
                    </div>
                  )}

                  {/* Priority */}
                  <div className="flex items-center gap-1.5 text-zinc-600">
                    Priority: {rule.priority}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
