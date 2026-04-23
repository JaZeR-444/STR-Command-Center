'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { AppState, Reservation } from '@/types';

function getTodayDateStr() {
  return new Date().toISOString().split('T')[0];
}

export function OperationsOverview({ state }: { state: AppState }) {
  const today = getTodayDateStr();
  const { reservations, guests, operationsTasks, inboxThreads, pricingRecommendations } = state;

  // Today's check-ins and check-outs
  const todayCheckIns = reservations.filter(r => r.checkIn.split('T')[0] === today);
  const todayCheckOuts = reservations.filter(r => r.checkOut.split('T')[0] === today);

  // Pending turnovers
  const pendingTurnovers = operationsTasks.filter(
    t => t.type === 'cleaning' && t.status === 'queued'
  );
  const inProgressTurnovers = operationsTasks.filter(
    t => t.type === 'cleaning' && t.status === 'in_progress'
  );

  // Unread messages
  const unreadCount = inboxThreads.reduce((sum, thread) => sum + thread.unread, 0);
  const urgentMessages = inboxThreads.filter(t => t.urgent && t.unread > 0);

  // Pricing alerts (unapplied recommendations)
  const pricingAlerts = pricingRecommendations.filter(p => !p.applied);
  const highValueAlerts = pricingAlerts.filter(p => Math.abs(p.changePercentage) >= 15);

  // Revenue snapshot (MTD)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const mtdReservations = reservations.filter(r => {
    const checkIn = new Date(r.checkIn);
    return checkIn.getMonth() === currentMonth && checkIn.getFullYear() === currentYear;
  });
  const mtdGross = mtdReservations.reduce((sum, r) => sum + r.total, 0);
  const mtdNights = mtdReservations.reduce((sum, r) => sum + r.totalNights, 0);
  const avgADR = mtdNights > 0 ? mtdGross / mtdNights : 0;

  const hasOperations = todayCheckIns.length > 0 || todayCheckOuts.length > 0 ||
                        pendingTurnovers.length > 0 || unreadCount > 0 ||
                        pricingAlerts.length > 0;

  if (!hasOperations) {
    return null; // Don't show section if no operations data
  }

  return (
    <section className="col-span-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-zinc-200">Today's Operations</h2>
        <p className="text-xs text-zinc-600 uppercase tracking-widest">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Check-ins / Check-outs */}
        <Link href="/calendar" className="block group">
          <Card className={cn(
            "h-full transition-all duration-200 group-hover:border-blue-500/40",
            todayCheckIns.length + todayCheckOuts.length > 0 ? "bg-blue-500/5 border-blue-500/20" : "bg-zinc-900/50 border-zinc-800"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Check-ins</span>
                <span className={cn(
                  "text-lg font-bold",
                  todayCheckIns.length > 0 ? "text-emerald-400" : "text-zinc-600"
                )}>
                  {todayCheckIns.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Check-outs</span>
                <span className={cn(
                  "text-lg font-bold",
                  todayCheckOuts.length > 0 ? "text-amber-400" : "text-zinc-600"
                )}>
                  {todayCheckOuts.length}
                </span>
              </div>
              {todayCheckIns.length > 0 && (
                <p className="text-[10px] text-zinc-600 mt-2">Next arrival: {guests[todayCheckIns[0].guestId]?.firstName || 'Guest'}</p>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Turnover Status */}
        <Link href="/operations" className="block group">
          <Card className={cn(
            "h-full transition-all duration-200 group-hover:border-amber-500/40",
            pendingTurnovers.length > 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-zinc-900/50 border-zinc-800"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v6m0 6v6m-5.66-5.66l4.24-4.24m4.24 4.24l4.24-4.24M1 12h6m6 0h6"/>
                </svg>
                Turnover Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Pending</span>
                <span className={cn(
                  "text-lg font-bold",
                  pendingTurnovers.length > 0 ? "text-amber-400" : "text-emerald-400"
                )}>
                  {pendingTurnovers.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">In Progress</span>
                <span className="text-lg font-bold text-blue-400">{inProgressTurnovers.length}</span>
              </div>
              {pendingTurnovers.length === 0 && inProgressTurnovers.length === 0 && (
                <p className="text-[10px] text-emerald-500 mt-2">All caught up ✓</p>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Messages */}
        <Link href="/inbox" className="block group">
          <Card className={cn(
            "h-full transition-all duration-200 group-hover:border-red-500/40",
            unreadCount > 0 ? "bg-red-500/5 border-red-500/20" : "bg-zinc-900/50 border-zinc-800"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Inbox
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Unread</span>
                <span className={cn(
                  "text-lg font-bold",
                  unreadCount > 0 ? "text-red-400" : "text-emerald-400"
                )}>
                  {unreadCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Urgent</span>
                <span className={cn(
                  "text-lg font-bold",
                  urgentMessages.length > 0 ? "text-red-400" : "text-zinc-600"
                )}>
                  {urgentMessages.length}
                </span>
              </div>
              {unreadCount === 0 && (
                <p className="text-[10px] text-emerald-500 mt-2">Inbox zero ✓</p>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Pricing & Revenue */}
        <Link href="/pricing" className="block group">
          <Card className={cn(
            "h-full transition-all duration-200 group-hover:border-indigo-500/40",
            highValueAlerts.length > 0 ? "bg-indigo-500/5 border-indigo-500/20" : "bg-zinc-900/50 border-zinc-800"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2v20M5 9l7-7 7 7"/>
                </svg>
                Pricing & Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">MTD Gross</span>
                <span className="text-lg font-bold text-emerald-400">
                  ${Math.round(mtdGross).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Avg ADR</span>
                <span className="text-lg font-bold text-blue-400">${Math.round(avgADR)}</span>
              </div>
              {pricingAlerts.length > 0 && (
                <p className="text-[10px] text-amber-400 mt-2">{pricingAlerts.length} pricing updates pending</p>
              )}
            </CardContent>
          </Card>
        </Link>

      </div>
    </section>
  );
}
