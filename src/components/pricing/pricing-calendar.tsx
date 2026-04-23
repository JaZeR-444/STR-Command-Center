'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { DailyPricing, Reservation } from '@/types';

const strategyColors = {
  base: 'bg-zinc-900/50 border-zinc-800',
  weekend: 'bg-blue-500/10 border-blue-500/30',
  event: 'bg-purple-500/10 border-purple-500/30',
  orphan_gap: 'bg-amber-500/10 border-amber-500/30',
  last_minute: 'bg-emerald-500/10 border-emerald-500/30',
  seasonal: 'bg-pink-500/10 border-pink-500/30',
  custom: 'bg-zinc-700/20 border-zinc-700/40',
};

export function PricingCalendar({
  pricing,
  reservations,
  month,
  year,
  onDateClick,
}: {
  pricing: DailyPricing[];
  reservations: Reservation[];
  month: number;
  year: number;
  onDateClick?: (date: string, currentPricing?: DailyPricing) => void;
}) {
  // Build calendar grid
  const { daysInMonth, firstDayOfWeek, calendarDays } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    // Build array of days with pricing info
    const days: Array<{ day: number; date: string; pricing?: DailyPricing; booked?: boolean }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayPricing = pricing.find(p => p.date === dateStr);
      const isBooked = reservations.some(r => {
        const checkIn = new Date(r.checkIn);
        const checkOut = new Date(r.checkOut);
        return date >= checkIn && date < checkOut;
      });

      days.push({ day, date: dateStr, pricing: dayPricing, booked: isBooked });
    }

    return { daysInMonth, firstDayOfWeek, calendarDays: days };
  }, [pricing, reservations, month, year]);

  // Calculate stats
  const stats = useMemo(() => {
    const monthPricing = calendarDays.filter(d => d.pricing);
    const avgPrice = monthPricing.length > 0
      ? Math.round(monthPricing.reduce((sum, d) => sum + (d.pricing?.finalPrice || 0), 0) / monthPricing.length)
      : 0;
    const minPrice = monthPricing.length > 0
      ? Math.min(...monthPricing.map(d => d.pricing?.finalPrice || 0))
      : 0;
    const maxPrice = monthPricing.length > 0
      ? Math.max(...monthPricing.map(d => d.pricing?.finalPrice || 0))
      : 0;
    const bookedDays = calendarDays.filter(d => d.booked).length;
    const availableDays = calendarDays.filter(d => d.pricing?.available && !d.booked).length;

    return { avgPrice, minPrice, maxPrice, bookedDays, availableDays };
  }, [calendarDays]);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Avg Price</p>
          <p className="text-lg font-bold text-white">${stats.avgPrice}</p>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Min/Max</p>
          <p className="text-lg font-bold text-white">${stats.minPrice}-${stats.maxPrice}</p>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Booked</p>
          <p className="text-lg font-bold text-emerald-400">{stats.bookedDays} days</p>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Available</p>
          <p className="text-lg font-bold text-blue-400">{stats.availableDays} days</p>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Potential Rev</p>
          <p className="text-lg font-bold text-purple-400">${(stats.avgPrice * stats.availableDays).toLocaleString()}</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-zinc-900/30 rounded-xl border-2 border-zinc-800 p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Actual days */}
          {calendarDays.map(({ day, date, pricing: dayPricing, booked }) => {
            const strategy = dayPricing?.strategy || 'base';
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <button
                key={date}
                onClick={() => onDateClick?.(date, dayPricing)}
                className={cn(
                  'aspect-square rounded-lg border-2 p-2 transition-all hover:scale-105 hover:shadow-lg relative group',
                  booked && 'opacity-40 cursor-not-allowed',
                  !booked && 'hover:border-blue-500',
                  isToday && 'ring-2 ring-blue-400',
                  strategyColors[strategy]
                )}
                disabled={booked}
              >
                {/* Day number */}
                <div className="text-xs font-bold text-white mb-1">{day}</div>

                {/* Price */}
                {dayPricing && !booked && (
                  <div className="text-xs font-semibold text-emerald-400">
                    ${dayPricing.finalPrice}
                  </div>
                )}

                {/* Booked indicator */}
                {booked && (
                  <div className="text-[10px] font-semibold text-zinc-600 uppercase">
                    Booked
                  </div>
                )}

                {/* Min stay indicator */}
                {dayPricing && dayPricing.minStay > 1 && !booked && (
                  <div className="text-[9px] text-zinc-600 mt-0.5">
                    {dayPricing.minStay}n min
                  </div>
                )}

                {/* Strategy indicator tooltip */}
                {dayPricing?.strategyLabel && !booked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {dayPricing.strategyLabel}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className={cn('w-4 h-4 rounded border-2', strategyColors.base)} />
          <span className="text-zinc-400">Base Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-4 h-4 rounded border-2', strategyColors.weekend)} />
          <span className="text-zinc-400">Weekend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-4 h-4 rounded border-2', strategyColors.event)} />
          <span className="text-zinc-400">Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-4 h-4 rounded border-2', strategyColors.seasonal)} />
          <span className="text-zinc-400">Seasonal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('w-4 h-4 rounded border-2', strategyColors.last_minute)} />
          <span className="text-zinc-400">Last Minute</span>
        </div>
      </div>
    </div>
  );
}
