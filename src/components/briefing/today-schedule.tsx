'use client';

import { cn } from '@/lib/utils';
import type { Reservation, OperationsTask, GuestProfile } from '@/types';
import { properties } from '@/data/properties';

const priorityColors = {
  p0: 'bg-red-500/10 text-red-400 border-red-500/20',
  p1: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  p2: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  p3: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export function TodaySchedule({
  checkIns,
  checkOuts,
  tasks,
  guests,
}: {
  checkIns: Reservation[];
  checkOuts: Reservation[];
  tasks: OperationsTask[];
  guests: Record<string, GuestProfile>;
}) {
  return (
    <div className="space-y-6">
      {/* Check-Ins */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          <h3 className="text-sm font-semibold text-white">
            Check-Ins Today ({checkIns.length})
          </h3>
        </div>
        {checkIns.length === 0 ? (
          <p className="text-xs text-zinc-500 ml-7">No check-ins today</p>
        ) : (
          <div className="space-y-2">
            {checkIns.map(reservation => {
              const guest = guests[reservation.guestId];
              const property = properties.find(p => p.id === reservation.propertyId);
              return (
                <div
                  key={reservation.id}
                  className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 ml-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">
                          {guest?.firstName} {guest?.lastName}
                        </p>
                        {reservation.earlyCheckIn && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-medium">
                            EARLY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">{property?.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {reservation.guests} guest{reservation.guests > 1 ? 's' : ''} • {reservation.totalNights} night{reservation.totalNights > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-emerald-400">${reservation.total.toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-500">{reservation.source}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Check-Outs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <h3 className="text-sm font-semibold text-white">
            Check-Outs Today ({checkOuts.length})
          </h3>
        </div>
        {checkOuts.length === 0 ? (
          <p className="text-xs text-zinc-500 ml-7">No check-outs today</p>
        ) : (
          <div className="space-y-2">
            {checkOuts.map(reservation => {
              const guest = guests[reservation.guestId];
              const property = properties.find(p => p.id === reservation.propertyId);
              return (
                <div
                  key={reservation.id}
                  className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 ml-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">
                          {guest?.firstName} {guest?.lastName}
                        </p>
                        {reservation.lateCheckOut && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-medium">
                            LATE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">{property?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500">{reservation.source}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3 className="text-sm font-semibold text-white">
            Operations Tasks ({tasks.length})
          </h3>
        </div>
        {tasks.length === 0 ? (
          <p className="text-xs text-zinc-500 ml-7">No tasks scheduled today</p>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => {
              const property = properties.find(p => p.id === task.propertyId);
              return (
                <div
                  key={task.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 ml-7"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">{task.title}</p>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-medium border uppercase',
                          priorityColors[task.priority]
                        )}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{property?.name}</p>
                      {task.scheduledTimeStart && (
                        <p className="text-[10px] text-zinc-500 mt-1">
                          {task.scheduledTimeStart}
                          {task.scheduledTimeEnd && ` - ${task.scheduledTimeEnd}`}
                        </p>
                      )}
                    </div>
                    {task.assigneeName && (
                      <p className="text-[10px] text-zinc-500">{task.assigneeName}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
