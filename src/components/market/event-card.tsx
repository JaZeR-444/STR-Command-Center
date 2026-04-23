'use client';

import { cn } from '@/lib/utils';
import type { LocalEvent } from '@/types';

const categoryColors = {
  festival: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  sports: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  conference: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  concert: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  holiday: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  convention: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  other: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const impactColors = {
  low: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  extreme: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const impactIcons = {
  low: '○',
  medium: '◐',
  high: '◕',
  extreme: '●',
};

export function EventCard({ event }: { event: LocalEvent }) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isSingleDay = event.startDate === event.endDate;
  const daysUntil = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className={cn(
      'bg-zinc-900/30 border-2 rounded-xl p-4 transition-all',
      event.impact === 'extreme' && 'border-red-500/30 bg-red-500/5',
      event.impact === 'high' && 'border-amber-500/30 bg-amber-500/5',
      event.impact === 'medium' && 'border-blue-500/30',
      event.impact === 'low' && 'border-zinc-800'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-1">{event.name}</h3>
          <p className="text-xs text-zinc-400">{event.venue || 'Various venues'}</p>
        </div>
        <div className="flex gap-1">
          <span className={cn(
            'px-2 py-0.5 rounded text-[10px] font-medium border uppercase',
            categoryColors[event.category]
          )}>
            {event.category}
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-2 mb-3 text-xs text-zinc-300">
        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {isSingleDay ? (
          <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        ) : (
          <span>
            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
        <span className="text-zinc-500">•</span>
        <span className={cn(
          daysUntil < 7 ? 'text-amber-400 font-medium' : 'text-zinc-500'
        )}>
          {daysUntil > 0 ? `${daysUntil} days away` : daysUntil === 0 ? 'Today!' : 'Past event'}
        </span>
      </div>

      {/* Impact & Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className={cn(
          'rounded-lg p-2 border',
          impactColors[event.impact]
        )}>
          <p className="text-[10px] text-zinc-500 mb-0.5">Impact Level</p>
          <p className="text-sm font-bold flex items-center gap-1">
            <span>{impactIcons[event.impact]}</span>
            <span className="uppercase">{event.impact}</span>
          </p>
        </div>
        {event.expectedVisitors && (
          <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800">
            <p className="text-[10px] text-zinc-500 mb-0.5">Expected Visitors</p>
            <p className="text-sm font-bold text-emerald-400">
              {event.expectedVisitors.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Pricing Suggestions */}
      {(event.suggestedPriceIncrease || event.suggestedMinStay) && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2 mb-3">
          <p className="text-[10px] text-blue-400 font-medium mb-1">Pricing Recommendations</p>
          <div className="flex gap-3 text-xs">
            {event.suggestedPriceIncrease && (
              <div>
                <span className="text-zinc-500">Price:</span>{' '}
                <span className="text-white font-semibold">+{event.suggestedPriceIncrease}%</span>
              </div>
            )}
            {event.suggestedMinStay && (
              <div>
                <span className="text-zinc-500">Min Stay:</span>{' '}
                <span className="text-white font-semibold">{event.suggestedMinStay}N</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {event.description && (
        <p className="text-xs text-zinc-400 mb-3">{event.description}</p>
      )}

      {/* Notes */}
      {event.notes && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2 mb-3">
          <p className="text-xs text-zinc-400">{event.notes}</p>
        </div>
      )}

      {/* Link */}
      {event.url && (
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <span>Event website</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      )}
    </div>
  );
}
