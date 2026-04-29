'use client';

import { useApp } from '@/lib/context';
import {
  getTodayCheckIns,
  getTodayCheckOuts,
  getActiveTurnovers,
  getUrgentSummary,
  getRevenueStats,
  getOccupancyPacing,
  getRecentActivity,
  getUpcomingReservations,
} from '@/lib/selectors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { OperationsOverview } from '@/components/dashboard/operations-overview';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function DashboardPage() {
  const { state, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-[#d9b36c]/20 border-t-[#d9b36c] animate-spin" />
        <p className="mt-4 text-zinc-500 font-mono text-sm tracking-widest uppercase">Initializing Command Center</p>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const urgentSummary = getUrgentSummary(state);
  const revenueStats = getRevenueStats(state);
  const occupancy7 = getOccupancyPacing(state, 7);
  const occupancy30 = getOccupancyPacing(state, 30);
  const recentActivity = getRecentActivity(state, 5);
  const upcomingRes = getUpcomingReservations(state, 7);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden min-h-screen pb-24 lg:pb-8">
      {/* 1. Header Area */}
      <header className="px-5 py-6 lg:px-10 lg:py-10 pb-0 shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-[1400px] mx-auto">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
              <span className="text-zinc-500 text-sm font-medium">Ballydawn Drive</span>
            </div>
            <h1 className="text-3xl lg:text-[2.5rem] font-display font-bold text-white tracking-tight leading-tight">
              Morning Briefing
            </h1>
            <p className="text-zinc-400 mt-2 text-sm lg:text-base">{todayStr}</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-5 lg:px-10 py-8 lg:py-10 max-w-[1400px] w-full mx-auto space-y-8 lg:space-y-12">
        
        {/* 2. Today's Operations Overview Component (reusing and enhancing existing) */}
        <OperationsOverview state={state} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN: Urgent & Revenue */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            
            {/* 3. Urgent Attention */}
            {urgentSummary.total > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-display font-bold text-zinc-200">Requires Attention</h2>
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20 font-bold">
                    {urgentSummary.total} Items
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {urgentSummary.unreadMessages > 0 && (
                    <Link href="/inbox">
                      <Card className="bg-red-500/5 border-red-500/20 hover:border-red-500/40 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </div>
                            <span className="font-medium text-red-200">Unread Messages</span>
                          </div>
                          <span className="text-xl font-bold text-red-400">{urgentSummary.unreadMessages}</span>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                  
                  {urgentSummary.openIssues > 0 && (
                    <Link href="/issues">
                      <Card className={cn(
                        "transition-colors",
                        urgentSummary.urgentIssues > 0 ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40" : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                      )}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              urgentSummary.urgentIssues > 0 ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                            )}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            </div>
                            <span className={cn("font-medium", urgentSummary.urgentIssues > 0 ? "text-red-200" : "text-amber-200")}>Open Issues</span>
                          </div>
                          <span className={cn("text-xl font-bold", urgentSummary.urgentIssues > 0 ? "text-red-400" : "text-amber-400")}>{urgentSummary.openIssues}</span>
                        </CardContent>
                      </Card>
                    </Link>
                  )}

                  {urgentSummary.emptyNightsNext7 > 0 && (
                    <Link href="/pricing">
                      <Card className="bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            </div>
                            <span className="font-medium text-indigo-200">Empty Nights (Next 7)</span>
                          </div>
                          <span className="text-xl font-bold text-indigo-400">{urgentSummary.emptyNightsNext7}</span>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                  
                  {urgentSummary.overdueTasks > 0 && (
                    <Link href="/operations">
                      <Card className="bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <span className="font-medium text-amber-200">Overdue Tasks</span>
                          </div>
                          <span className="text-xl font-bold text-amber-400">{urgentSummary.overdueTasks}</span>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                </div>
              </section>
            )}

            {/* 4. Revenue & Occupancy Snapshot */}
            <section>
              <h2 className="text-lg font-display font-bold text-zinc-200 mb-4">Performance Snapshot</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass border-white/5">
                  <CardContent className="p-5">
                    <p className="text-xs text-zinc-500 mb-1">MTD Revenue</p>
                    <p className="text-2xl font-bold text-emerald-400">${revenueStats.mtdRevenue.toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        revenueStats.changePercent >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {revenueStats.changePercent >= 0 ? '+' : ''}{revenueStats.changePercent}%
                      </span>
                      <span className="text-[10px] text-zinc-500">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass border-white/5">
                  <CardContent className="p-5">
                    <p className="text-xs text-zinc-500 mb-1">Avg ADR</p>
                    <p className="text-2xl font-bold text-blue-400">${revenueStats.adr}</p>
                    <p className="mt-2 text-[10px] text-zinc-500">MTD Average</p>
                  </CardContent>
                </Card>

                <Card className="glass border-white/5">
                  <CardContent className="p-5">
                    <p className="text-xs text-zinc-500 mb-1">7-Day Occupancy</p>
                    <p className="text-2xl font-bold text-indigo-400">{occupancy7.pct}%</p>
                    <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${occupancy7.pct}%` }} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-white/5">
                  <CardContent className="p-5">
                    <p className="text-xs text-zinc-500 mb-1">30-Day Occupancy</p>
                    <p className="text-2xl font-bold text-[#d9b36c]">{occupancy30.pct}%</p>
                    <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-[#d9b36c] rounded-full" style={{ width: `${occupancy30.pct}%` }} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* 6. Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-zinc-200">Recent Activity</h2>
                <Link href="/reports" className="text-xs text-blue-400 hover:text-blue-300">View All</Link>
              </div>
              <Card className="glass border-white/5">
                <div className="divide-y divide-white/5">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((event) => (
                      <Link key={event.id} href={event.href} className="block p-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            event.type === 'booking' ? "bg-emerald-500/10 text-emerald-400" :
                            event.type === 'message' ? "bg-blue-500/10 text-blue-400" :
                            event.type === 'turnover' ? "bg-amber-500/10 text-amber-400" :
                            event.type === 'issue' ? "bg-red-500/10 text-red-400" :
                            "bg-zinc-800 text-zinc-400"
                          )}>
                            {event.type === 'booking' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
                            {event.type === 'message' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>}
                            {event.type === 'turnover' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>}
                            {event.type === 'issue' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-zinc-200 truncate">{event.title}</p>
                              <span className="text-xs text-zinc-500 whitespace-nowrap">{formatDate(event.timestamp)}</span>
                            </div>
                            <p className="text-sm text-zinc-400 truncate">{event.detail}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center text-zinc-500 text-sm">
                      No recent activity.
                    </div>
                  )}
                </div>
              </Card>
            </section>
          </div>

          {/* RIGHT COLUMN: Upcoming & Actions */}
          <div className="space-y-6 lg:space-y-8">
            
            {/* 5. Quick Actions */}
            <section>
              <h2 className="text-lg font-display font-bold text-zinc-200 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/calendar" className="flex flex-col items-center justify-center p-4 rounded-xl glass border border-white/5 hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-[#8ab4ff]/10 flex items-center justify-center text-[#8ab4ff] mb-2 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                  </div>
                  <span className="text-xs font-medium text-zinc-300">Add Block</span>
                </Link>
                <Link href="/operations" className="flex flex-col items-center justify-center p-4 rounded-xl glass border border-white/5 hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-[#d9b36c]/10 flex items-center justify-center text-[#d9b36c] mb-2 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                  </div>
                  <span className="text-xs font-medium text-zinc-300">New Task</span>
                </Link>
                <Link href="/issues" className="flex flex-col items-center justify-center p-4 rounded-xl glass border border-white/5 hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  </div>
                  <span className="text-xs font-medium text-zinc-300">Log Issue</span>
                </Link>
                <Link href="/pricing" className="flex flex-col items-center justify-center p-4 rounded-xl glass border border-white/5 hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <span className="text-xs font-medium text-zinc-300">Update Rate</span>
                </Link>
              </div>
            </section>

            {/* 7. Upcoming Reservations */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-zinc-200">Next 7 Days</h2>
                <Link href="/calendar" className="text-xs text-blue-400 hover:text-blue-300">Calendar</Link>
              </div>
              <Card className="glass border-white/5">
                <div className="divide-y divide-white/5">
                  {upcomingRes.length > 0 ? (
                    upcomingRes.map(res => {
                      const guest = state.guests[res.guestId];
                      const guestName = guest ? `${guest.firstName} ${guest.lastName}` : 'Guest';
                      return (
                        <div key={res.id} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{guestName}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{formatDate(res.checkIn)} – {formatDate(res.checkOut)}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={cn(
                              "text-[10px] font-bold uppercase tracking-wider",
                              res.source === 'airbnb' ? "text-[#FF5A5F] border-[#FF5A5F]/30" :
                              res.source === 'vrbo' ? "text-[#00529B] border-[#00529B]/30" :
                              "text-zinc-300 border-zinc-600"
                            )}>
                              {res.source}
                            </Badge>
                            <p className="text-xs text-zinc-400 mt-1">{res.totalNights} nights</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-zinc-500 text-sm">
                      No upcoming reservations in the next 7 days.
                    </div>
                  )}
                </div>
              </Card>
            </section>

          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto px-10 py-6 border-t border-white/5 text-center shrink-0">
        <p className="text-xs text-zinc-600 font-mono">
          7513 Ballydawn Dr · Live since 2026
        </p>
      </footer>
    </div>
  );
}
