'use client';

import { useApp } from '@/lib/context';
import { properties } from '@/data/properties';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ReservationDetailModal } from '@/components/reservations/reservation-detail-modal';
import { QuickAddReservation } from '@/components/calendar/quick-add-reservation';
import { cn } from '@/lib/utils';
import type { Reservation, OperationsTask } from '@/types';

const channelColors = {
  airbnb: 'bg-[#FF5A5F]/20 border-[#FF5A5F]/40',
  booking: 'bg-[#003580]/20 border-[#003580]/40',
  vrbo: 'bg-[#0071C2]/20 border-[#0071C2]/40',
  direct: 'bg-purple-500/20 border-purple-500/40',
};

const channelBorderColors = {
  airbnb: 'border-l-[#FF5A5F]',
  booking: 'border-l-[#003580]',
  vrbo: 'border-l-[#0071C2]',
  direct: 'border-l-purple-500',
};

export default function CalendarPage() {
  const { state } = useApp();
  const { reservations, calendarEvents, operationsTasks } = state;
  const property = properties[0];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [quickAddDate, setQuickAddDate] = useState<string | null>(null);

  // Get current month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Navigation
  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      reservation?: Reservation;
      isBlocked?: boolean;
      isCheckIn?: boolean;
      isCheckOut?: boolean;
      turnoverTask?: OperationsTask;
    }> = [];

    // Previous month trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        dateStr: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const today = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];

      const reservation = reservations.find(r => {
        const checkIn = r.checkIn.split('T')[0];
        const checkOut = r.checkOut.split('T')[0];
        return dateStr >= checkIn && dateStr < checkOut;
      });

      const isCheckIn = reservation && dateStr === reservation.checkIn.split('T')[0];
      const isCheckOut = reservation && dateStr === reservation.checkOut.split('T')[0];

      const blocked = calendarEvents.find(e =>
        e.type === 'blocked' &&
        e.startDate <= dateStr &&
        e.endDate >= dateStr
      );

      // Find turnover task for this date
      const turnoverTask = operationsTasks.find(t =>
        t.type === 'cleaning' &&
        t.scheduledDate === dateStr
      );

      days.push({
        date,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today,
        reservation,
        isBlocked: !!blocked,
        isCheckIn,
        isCheckOut,
        turnoverTask,
      });
    }

    // Next month leading days
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        dateStr: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [year, month, daysInMonth, startingDayOfWeek, reservations, calendarEvents, operationsTasks]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Month stats
  const monthStats = useMemo(() => {
    const monthReservations = reservations.filter(r => {
      const checkIn = new Date(r.checkIn);
      return checkIn.getMonth() === month && checkIn.getFullYear() === year;
    });
    const totalRevenue = monthReservations.reduce((sum, r) => sum + r.total, 0);
    const occupiedNights = monthReservations.reduce((sum, r) => sum + r.totalNights, 0);
    const occupancyRate = Math.round((occupiedNights / daysInMonth) * 100);

    return { bookings: monthReservations.length, revenue: totalRevenue, occupancyRate };
  }, [reservations, month, year, daysInMonth]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            Calendar
          </h1>
          <p className="text-zinc-400 text-sm mt-2">{property?.name || 'Property'} - Booking & Operations</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              ←
            </button>
            <div className="text-lg font-semibold text-white min-w-[200px] text-center">
              {monthName}
            </div>
            <button
              onClick={goToNextMonth}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </header>

      {/* Month Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl border border-zinc-800 px-4 py-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Bookings</p>
          <p className="text-2xl font-bold text-white">{monthStats.bookings}</p>
        </div>
        <div className="glass rounded-xl border border-zinc-800 px-4 py-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">${monthStats.revenue.toLocaleString()}</p>
        </div>
        <div className="glass rounded-xl border border-zinc-800 px-4 py-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Occupancy</p>
          <p className="text-2xl font-bold text-blue-400">{monthStats.occupancyRate}%</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#FF5A5F]/30" />
          <span className="text-zinc-400">Airbnb</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0071C2]/30" />
          <span className="text-zinc-400">Vrbo/Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500/30" />
          <span className="text-zinc-400">Direct</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/30" />
          <span className="text-zinc-400">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
          </svg>
          <span className="text-zinc-400">Turnover</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-2xl border-2 border-zinc-800 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[110px] p-2 border-r border-b border-zinc-800/60 relative group cursor-pointer hover:bg-zinc-900/30 transition-colors",
                  !day.isCurrentMonth && "bg-zinc-950/50 opacity-40",
                  day.isToday && "ring-2 ring-blue-500 ring-inset z-10",
                  day.reservation && channelColors[day.reservation.source],
                  day.reservation && channelBorderColors[day.reservation.source] + ' border-l-4',
                  day.isBlocked && "bg-red-500/10 border-l-4 border-l-red-500",
                  i % 7 === 6 && "border-r-0"
                )}
                onClick={(e) => {
                  if (day.reservation) {
                    setSelectedReservation(day.reservation);
                  } else if (day.isCurrentMonth) {
                    // Quick-add on empty days
                    setQuickAddDate(day.dateStr);
                  }
                }}
              >
                {/* Date number */}
                <div className={cn(
                  "text-sm font-semibold mb-1",
                  day.isCurrentMonth ? "text-zinc-300" : "text-zinc-600",
                  day.isToday && "text-blue-400 font-bold"
                )}>
                  {day.date.getDate()}
                </div>

                {/* Reservation info */}
                {day.reservation && day.isCheckIn && (
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-white truncate">
                      {state.guests[day.reservation.guestId]
                        ? `${state.guests[day.reservation.guestId].firstName} ${state.guests[day.reservation.guestId].lastName}`
                        : 'Guest'}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium">Check-in</span>
                    </div>
                    <div className="text-zinc-500 capitalize">{day.reservation.source}</div>
                  </div>
                )}

                {day.reservation && day.isCheckOut && !day.isCheckIn && (
                  <div className="text-xs">
                    <div className="flex items-center gap-1 text-amber-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium">Check-out</span>
                    </div>
                  </div>
                )}

                {day.isBlocked && (
                  <div className="text-xs text-red-400 font-semibold">Blocked</div>
                )}

                {/* Turnover status icon */}
                {day.turnoverTask && (
                  <div className="absolute bottom-2 right-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      day.turnoverTask.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      day.turnoverTask.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-amber-500/20 text-amber-400'
                    )}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Empty state hint */}
                {!day.reservation && !day.isBlocked && day.isCurrentMonth && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center">
                    <div className="bg-zinc-900/90 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-400">
                      Click to add
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}

      {/* Quick Add Modal */}
      {quickAddDate && (
        <QuickAddReservation
          initialDate={quickAddDate}
          onClose={() => setQuickAddDate(null)}
        />
      )}
    </div>
  );
}
