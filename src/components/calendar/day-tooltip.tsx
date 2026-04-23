'use client';

import { cn } from '@/lib/utils';
import type { Reservation, OperationsTask } from '@/types';

const channelColors = {
  airbnb: 'text-[#FF5A5F]',
  booking: 'text-[#003580]',
  vrbo: 'text-[#0071C2]',
  direct: 'text-purple-400',
};

export function DayTooltip({
  date,
  reservation,
  turnoverTask,
  isCheckIn,
  isCheckOut,
  revenue,
}: {
  date: Date;
  reservation?: Reservation;
  turnoverTask?: OperationsTask;
  isCheckIn?: boolean;
  isCheckOut?: boolean;
  revenue?: number;
}) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="bg-zinc-900 border-2 border-zinc-700 rounded-lg px-3 py-2 shadow-xl min-w-[200px]">
        <div className="text-xs font-semibold text-white mb-2">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>

        {reservation && (
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Guest:</span>
              <span className="text-white font-medium">Guest Name</span>
            </div>
            {isCheckIn && (
              <div className="flex items-center gap-1 text-emerald-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold">Check-in</span>
              </div>
            )}
            {isCheckOut && (
              <div className="flex items-center gap-1 text-amber-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold">Check-out</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Channel:</span>
              <span className={cn('font-semibold capitalize', channelColors[reservation.source])}>
                {reservation.source}
              </span>
            </div>
            {revenue && (
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                <span className="text-zinc-400">Revenue:</span>
                <span className="text-emerald-400 font-bold">${revenue}</span>
              </div>
            )}
          </div>
        )}

        {turnoverTask && (
          <div className="mt-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs">
              <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v6m0 6v6"/>
              </svg>
              <span className="text-zinc-400">Turnover:</span>
              <span className={cn(
                'font-semibold',
                turnoverTask.status === 'completed' ? 'text-emerald-400' :
                turnoverTask.status === 'in_progress' ? 'text-blue-400' :
                'text-amber-400'
              )}>
                {turnoverTask.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {!reservation && !turnoverTask && (
          <div className="text-xs text-zinc-500">Available</div>
        )}
      </div>
      {/* Arrow */}
      <div className="w-3 h-3 bg-zinc-900 border-r-2 border-b-2 border-zinc-700 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" />
    </div>
  );
}
