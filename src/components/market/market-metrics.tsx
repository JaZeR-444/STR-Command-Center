'use client';

import { cn } from '@/lib/utils';
import type { MarketMetrics } from '@/types';

const trendIcons = {
  up: '↗',
  down: '↘',
  stable: '→',
};

const trendColors = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  stable: 'text-zinc-400',
};

export function MarketMetricsDisplay({ metrics }: { metrics: MarketMetrics }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Neighborhood Occupancy */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500">Neighborhood Occ.</p>
          <span className={cn('text-sm', trendColors[metrics.occupancyTrend])}>
            {trendIcons[metrics.occupancyTrend]}
          </span>
        </div>
        <p className="text-2xl font-bold text-white">{metrics.neighborhoodOccupancy}%</p>
        <p className="text-[10px] text-zinc-500 mt-1">vs {metrics.cityOccupancy}% citywide</p>
      </div>

      {/* Avg Daily Rate */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500">Avg Daily Rate</p>
          <span className={cn('text-sm', trendColors[metrics.priceTrend])}>
            {trendIcons[metrics.priceTrend]}
          </span>
        </div>
        <p className="text-2xl font-bold text-emerald-400">${metrics.avgDailyRate}</p>
        <p className="text-[10px] text-zinc-500 mt-1">Neighborhood avg</p>
      </div>

      {/* Demand Index */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500">Demand Index</p>
          <span className={cn('text-sm', trendColors[metrics.demandTrend])}>
            {trendIcons[metrics.demandTrend]}
          </span>
        </div>
        <p className="text-2xl font-bold text-blue-400">{metrics.demandIndex}</p>
        <p className="text-[10px] text-zinc-500 mt-1">0-100 scale</p>
      </div>

      {/* Competitors */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500">Active Listings</p>
        </div>
        <p className="text-2xl font-bold text-purple-400">{metrics.competitorCount}</p>
        <p className="text-[10px] text-zinc-500 mt-1">
          {metrics.newListings > 0 && `+${metrics.newListings} new (30d)`}
        </p>
      </div>

      {/* Min Stay */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-500">Avg Min Stay</p>
        </div>
        <p className="text-2xl font-bold text-amber-400">{metrics.avgMinStay.toFixed(1)}N</p>
        <p className="text-[10px] text-zinc-500 mt-1">Neighborhood avg</p>
      </div>
    </div>
  );
}
