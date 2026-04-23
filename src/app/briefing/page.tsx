'use client';

import { useMemo } from 'react';
import { useApp } from '@/lib/context';
import { generateDailyBriefing, getGreeting, formatDateForBriefing } from '@/lib/briefing-utils';
import { ActionItems } from '@/components/briefing/action-items';
import { TodaySchedule } from '@/components/briefing/today-schedule';

export default function BriefingPage() {
  const { state } = useApp();

  const briefing = useMemo(() => {
    return generateDailyBriefing(state);
  }, [state]);

  const greeting = getGreeting();
  const dateString = formatDateForBriefing();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {greeting}
        </h1>
        <p className="text-zinc-400 text-sm mt-2">{dateString}</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            <p className="text-xs text-zinc-500">Check-Ins</p>
          </div>
          <p className="text-2xl font-bold text-white">{briefing.summary.checkIns}</p>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <p className="text-xs text-zinc-500">Check-Outs</p>
          </div>
          <p className="text-2xl font-bold text-white">{briefing.summary.checkOuts}</p>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p className="text-xs text-zinc-500">Tasks</p>
          </div>
          <p className="text-2xl font-bold text-white">{briefing.summary.tasksToday}</p>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p className="text-xs text-zinc-500">Urgent Issues</p>
          </div>
          <p className="text-2xl font-bold text-white">{briefing.summary.urgentIssues}</p>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <p className="text-xs text-zinc-500">Messages</p>
          </div>
          <p className="text-2xl font-bold text-white">{briefing.summary.unreadMessages}</p>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p className="text-xs text-zinc-500">Events</p>
          </div>
          <p className="text-2xl font-bold text-white">{briefing.summary.eventsToday}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Today's Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Properties Occupied</p>
            <p className="text-2xl font-bold text-white">{briefing.metrics.occupancyToday}</p>
            <p className="text-[10px] text-zinc-600 mt-1">of 3 properties</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Revenue Today</p>
            <p className="text-2xl font-bold text-emerald-400">${briefing.metrics.revenueToday.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-600 mt-1">from check-ins</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Avg Rating (30d)</p>
            <p className="text-2xl font-bold text-amber-400">
              {briefing.metrics.avgRating > 0 ? briefing.metrics.avgRating.toFixed(1) : '—'}
            </p>
            <p className="text-[10px] text-zinc-600 mt-1">guest ratings</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Response Rate</p>
            <p className="text-2xl font-bold text-blue-400">{briefing.metrics.responseRate.toFixed(0)}%</p>
            <p className="text-[10px] text-zinc-600 mt-1">message response</p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Action Items</h2>
        <ActionItems items={briefing.actionItems} />
      </div>

      {/* Today's Schedule */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Today's Schedule</h2>
        <TodaySchedule
          checkIns={briefing.checkIns}
          checkOuts={briefing.checkOuts}
          tasks={briefing.tasksToday}
          guests={state.guests}
        />
      </div>

      {/* Events Today */}
      {briefing.eventsToday.length > 0 && (
        <div className="glass rounded-xl border-2 border-zinc-800 p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Events Happening Today</h2>
          <div className="space-y-3">
            {briefing.eventsToday.map(event => (
              <div
                key={event.id}
                className="bg-pink-500/5 border border-pink-500/20 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">{event.name}</h3>
                    <p className="text-xs text-zinc-400 mb-2">{event.venue || 'Various venues'}</p>
                    {event.suggestedPriceIncrease && (
                      <p className="text-xs text-pink-400">
                        💡 Consider +{event.suggestedPriceIncrease}% pricing
                        {event.suggestedMinStay && ` with ${event.suggestedMinStay}N min stay`}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-medium uppercase ${
                    event.impact === 'extreme' ? 'bg-red-500/20 text-red-400' :
                    event.impact === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    event.impact === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {event.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
