'use client';

import { cn } from '@/lib/utils';
import type { MarketCompetitor } from '@/types';

const trendColors = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  stable: 'text-zinc-400',
};

export function CompetitorCard({ competitor }: { competitor: MarketCompetitor }) {
  // Calculate price trend
  const priceTrend = (() => {
    if (competitor.priceHistory.length < 2) return 'stable';
    const recent = competitor.priceHistory[competitor.priceHistory.length - 1].price;
    const previous = competitor.priceHistory[competitor.priceHistory.length - 2].price;
    if (recent > previous) return 'up';
    if (recent < previous) return 'down';
    return 'stable';
  })();

  const priceChange = (() => {
    if (competitor.priceHistory.length < 2) return 0;
    const recent = competitor.priceHistory[competitor.priceHistory.length - 1].price;
    const oldest = competitor.priceHistory[0].price;
    return ((recent - oldest) / oldest) * 100;
  })();

  return (
    <div className="bg-zinc-900/30 border-2 border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-1">{competitor.name}</h3>
          <p className="text-xs text-zinc-400">{competitor.propertyType} • {competitor.neighborhood}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">${competitor.currentPrice}</div>
          <div className={cn('text-xs font-medium', trendColors[priceTrend])}>
            {priceTrend === 'up' && '↑'}
            {priceTrend === 'down' && '↓'}
            {priceTrend === 'stable' && '→'}
            {' '}
            {Math.abs(priceChange).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="flex items-center gap-3 mb-3 text-xs text-zinc-400">
        <span>{competitor.beds} bed</span>
        <span>•</span>
        <span>{competitor.baths} bath</span>
        <span>•</span>
        <span>Sleeps {competitor.sleeps}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {competitor.rating && (
          <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800">
            <p className="text-[10px] text-zinc-500 mb-0.5">Rating</p>
            <p className="text-sm font-bold text-amber-400">
              {competitor.rating} ⭐
              {competitor.reviewCount && (
                <span className="text-[10px] text-zinc-500 ml-1">({competitor.reviewCount})</span>
              )}
            </p>
          </div>
        )}
        {competitor.estimatedOccupancy && (
          <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800">
            <p className="text-[10px] text-zinc-500 mb-0.5">Est. Occupancy</p>
            <p className="text-sm font-bold text-emerald-400">{competitor.estimatedOccupancy}%</p>
          </div>
        )}
      </div>

      {/* Distance tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {competitor.distanceFromP1 !== undefined && (
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium border border-blue-500/20">
            {competitor.distanceFromP1}mi from P1
          </span>
        )}
        {competitor.distanceFromP2 !== undefined && (
          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-medium border border-purple-500/20">
            {competitor.distanceFromP2}mi from P2
          </span>
        )}
        {competitor.distanceFromP3 !== undefined && (
          <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[10px] font-medium border border-pink-500/20">
            {competitor.distanceFromP3}mi from P3
          </span>
        )}
      </div>

      {/* Channel links */}
      {(competitor.airbnbUrl || competitor.vrboUrl || competitor.bookingUrl) && (
        <div className="flex gap-2">
          {competitor.airbnbUrl && (
            <a
              href={competitor.airbnbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 rounded-lg px-2 py-1.5 text-[10px] font-medium text-[#FF5A5F] hover:bg-[#FF5A5F]/20 transition-all text-center"
            >
              Airbnb
            </a>
          )}
          {competitor.vrboUrl && (
            <a
              href={competitor.vrboUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#0071C2]/10 border border-[#0071C2]/20 rounded-lg px-2 py-1.5 text-[10px] font-medium text-[#0071C2] hover:bg-[#0071C2]/20 transition-all text-center"
            >
              Vrbo
            </a>
          )}
          {competitor.bookingUrl && (
            <a
              href={competitor.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#003580]/10 border border-[#003580]/20 rounded-lg px-2 py-1.5 text-[10px] font-medium text-[#003580] hover:bg-[#003580]/20 transition-all text-center"
            >
              Booking
            </a>
          )}
        </div>
      )}

      {/* Notes */}
      {competitor.notes && (
        <div className="mt-3 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2">
          <p className="text-xs text-zinc-400">{competitor.notes}</p>
        </div>
      )}
    </div>
  );
}
