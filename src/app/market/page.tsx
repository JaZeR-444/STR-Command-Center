'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { CompetitorCard } from '@/components/market/competitor-card';
import { EventCard } from '@/components/market/event-card';
import { MarketMetricsDisplay } from '@/components/market/market-metrics';
import { cn } from '@/lib/utils';

type ViewMode = 'overview' | 'competitors' | 'events';

export default function MarketPage() {
  const { state } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [sortBy, setSortBy] = useState<'price' | 'occupancy' | 'rating' | 'distance'>('price');

  // Get latest market metrics
  const latestMetrics = useMemo(() => {
    if (state.marketMetrics.length === 0) return null;
    return state.marketMetrics[state.marketMetrics.length - 1];
  }, [state.marketMetrics]);

  // Sort competitors
  const sortedCompetitors = useMemo(() => {
    return [...state.marketCompetitors].sort((a, b) => {
      if (sortBy === 'price') {
        return b.currentPrice - a.currentPrice;
      } else if (sortBy === 'occupancy') {
        return (b.estimatedOccupancy || 0) - (a.estimatedOccupancy || 0);
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else {
        // distance from P1
        return (a.distanceFromP1 || 999) - (b.distanceFromP1 || 999);
      }
    });
  }, [state.marketCompetitors, sortBy]);

  // Filter and sort events
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return state.localEvents
      .filter(event => new Date(event.endDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [state.localEvents]);

  const pastEvents = useMemo(() => {
    const now = new Date();
    return state.localEvents
      .filter(event => new Date(event.endDate) < now)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [state.localEvents]);

  // Generate market insights
  const insights = useMemo(() => {
    if (!latestMetrics) return [];

    const insights: { type: 'opportunity' | 'warning' | 'info'; title: string; description: string }[] = [];

    // High demand
    if (latestMetrics.demandIndex > 75) {
      insights.push({
        type: 'opportunity',
        title: 'High Demand Period',
        description: `Demand index at ${latestMetrics.demandIndex}/100. Consider raising prices and implementing minimum stays.`,
      });
    }

    // Occupancy trends
    if (latestMetrics.occupancyTrend === 'up') {
      insights.push({
        type: 'opportunity',
        title: 'Rising Occupancy',
        description: `Neighborhood occupancy trending upward (${latestMetrics.neighborhoodOccupancy}%). Strong market conditions.`,
      });
    }

    // Price trends
    if (latestMetrics.priceTrend === 'down' && latestMetrics.occupancyTrend === 'down') {
      insights.push({
        type: 'warning',
        title: 'Market Softening',
        description: 'Both prices and occupancy trending down. Monitor competition closely.',
      });
    }

    // New listings
    if (latestMetrics.newListings > 10) {
      insights.push({
        type: 'warning',
        title: 'Increased Competition',
        description: `${latestMetrics.newListings} new listings in past 30 days. May impact pricing power.`,
      });
    }

    // Upcoming high-impact events
    const highImpactEvents = upcomingEvents.filter(e => e.impact === 'extreme' || e.impact === 'high');
    if (highImpactEvents.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Major Events Approaching',
        description: `${highImpactEvents.length} high-impact event(s) coming up. Review pricing strategy.`,
      });
    }

    return insights;
  }, [latestMetrics, upcomingEvents]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          Market Intelligence
        </h1>
        <p className="text-zinc-400 text-sm mt-2">Competitive analysis and market trends</p>
      </header>

      {/* Market Metrics */}
      {latestMetrics && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Market Snapshot</h2>
            <span className="text-xs text-zinc-500">
              Updated {new Date(latestMetrics.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <MarketMetricsDisplay metrics={latestMetrics} />
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Market Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  'rounded-xl border-2 p-4',
                  insight.type === 'opportunity' && 'bg-emerald-500/5 border-emerald-500/30',
                  insight.type === 'warning' && 'bg-amber-500/5 border-amber-500/30',
                  insight.type === 'info' && 'bg-blue-500/5 border-blue-500/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    insight.type === 'opportunity' && 'bg-emerald-500/10',
                    insight.type === 'warning' && 'bg-amber-500/10',
                    insight.type === 'info' && 'bg-blue-500/10'
                  )}>
                    {insight.type === 'opportunity' && (
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                    )}
                    {insight.type === 'warning' && (
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                    )}
                    {insight.type === 'info' && (
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">{insight.title}</h3>
                    <p className="text-xs text-zinc-400">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('overview')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            viewMode === 'overview'
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setViewMode('competitors')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            viewMode === 'competitors'
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          )}
        >
          Competitors ({state.marketCompetitors.length})
        </button>
        <button
          onClick={() => setViewMode('events')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            viewMode === 'events'
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          )}
        >
          Events ({upcomingEvents.length})
        </button>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Top Competitors */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Top Competitors</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedCompetitors.slice(0, 3).map(competitor => (
                <CompetitorCard key={competitor.id} competitor={competitor} />
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcomingEvents.slice(0, 4).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Competitors Mode */}
      {viewMode === 'competitors' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">All Competitors</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">Highest Price</option>
              <option value="occupancy">Highest Occupancy</option>
              <option value="rating">Highest Rating</option>
              <option value="distance">Closest to P1</option>
            </select>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedCompetitors.map(competitor => (
              <CompetitorCard key={competitor.id} competitor={competitor} />
            ))}
          </div>
        </div>
      )}

      {/* Events Mode */}
      {viewMode === 'events' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Upcoming Events</h2>
            {upcomingEvents.length === 0 ? (
              <div className="glass rounded-2xl border-2 border-zinc-800 p-12 text-center">
                <p className="text-zinc-400">No upcoming events</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Past Events</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-50">
                {pastEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
