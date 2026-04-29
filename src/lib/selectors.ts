// Operational selectors — computed values from state
// Replaces legacy project-centric selectors (launch readiness, section progress, etc.)

import type { AppState, Reservation, OperationsTask, MaintenanceIssue, InboxThread } from '@/types';

/* ─── Date Helpers ─────────────────────────────────── */

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

/* ─── Reservation Selectors ────────────────────────── */

/** Reservations checking in today */
export function getTodayCheckIns(state: AppState): Reservation[] {
  const today = todayStr();
  return state.reservations.filter(r => r.checkIn.split('T')[0] === today);
}

/** Reservations checking out today */
export function getTodayCheckOuts(state: AppState): Reservation[] {
  const today = todayStr();
  return state.reservations.filter(r => r.checkOut.split('T')[0] === today);
}

/** Reservations within the next N days */
export function getUpcomingReservations(state: AppState, days: number = 7): Reservation[] {
  const today = todayStr();
  const end = daysFromNow(days);
  return state.reservations
    .filter(r => r.checkIn >= today && r.checkIn <= end && r.status !== 'cancelled')
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
}

/** Currently active (checked-in) reservations */
export function getActiveReservations(state: AppState): Reservation[] {
  return state.reservations.filter(r => r.status === 'checked_in');
}

/** Is any guest currently occupying the property? */
export function getOccupancyStatus(state: AppState): 'occupied' | 'vacant' | 'turnover' {
  const today = todayStr();
  const hasCheckedIn = state.reservations.some(r => r.status === 'checked_in');
  if (hasCheckedIn) return 'occupied';

  const hasTurnoverToday = state.operationsTasks.some(
    t => t.type === 'cleaning' && t.scheduledDate === today && t.status !== 'completed'
  );
  if (hasTurnoverToday) return 'turnover';

  return 'vacant';
}

/* ─── Occupancy Metrics ────────────────────────────── */

/** Calculate occupancy % for the next N days */
export function getOccupancyPacing(state: AppState, days: number): { booked: number; total: number; pct: number } {
  const today = todayStr();
  const end = daysFromNow(days);
  const totalNights = days;

  // Count booked nights
  let bookedNights = 0;
  const dateSet = new Set<string>();

  state.reservations
    .filter(r => r.status !== 'cancelled')
    .forEach(r => {
      const checkIn = r.checkIn.split('T')[0];
      const checkOut = r.checkOut.split('T')[0];

      // Iterate each night of this reservation
      const ci = new Date(checkIn);
      const co = new Date(checkOut);
      for (let d = new Date(ci); d < co; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().split('T')[0];
        if (ds >= today && ds < end && !dateSet.has(ds)) {
          dateSet.add(ds);
          bookedNights++;
        }
      }
    });

  return {
    booked: bookedNights,
    total: totalNights,
    pct: totalNights > 0 ? Math.round((bookedNights / totalNights) * 100) : 0,
  };
}

/** Count empty (unbooked) nights in next N days */
export function getEmptyNights(state: AppState, days: number = 7): number {
  const occ = getOccupancyPacing(state, days);
  return occ.total - occ.booked;
}

/* ─── Revenue Metrics ──────────────────────────────── */

export interface RevenueSnapshot {
  mtdRevenue: number;
  mtdNights: number;
  adr: number;        // Average Daily Rate
  revPAN: number;     // Revenue per Available Night
  prevMonthRevenue: number;
  changePercent: number;
}

/** Get revenue metrics for the current month (and comparison) */
export function getRevenueStats(state: AppState): RevenueSnapshot {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  // Current month reservations (overlapping with this month)
  const mtdReservations = state.reservations.filter(r => {
    if (r.status === 'cancelled') return false;
    const ci = new Date(r.checkIn);
    const co = new Date(r.checkOut);
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    return ci <= monthEnd && co >= monthStart;
  });

  const mtdRevenue = mtdReservations.reduce((sum, r) => sum + r.total, 0);
  const mtdNights = mtdReservations.reduce((sum, r) => sum + r.totalNights, 0);
  const adr = mtdNights > 0 ? Math.round(mtdRevenue / mtdNights) : 0;
  const revPAN = daysInMonth > 0 ? Math.round(mtdRevenue / dayOfMonth) : 0;

  // Previous month for comparison
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthRevenue = state.reservations
    .filter(r => {
      if (r.status === 'cancelled') return false;
      const ci = new Date(r.checkIn);
      return ci.getMonth() === prevMonth && ci.getFullYear() === prevYear;
    })
    .reduce((sum, r) => sum + r.total, 0);

  const changePercent = prevMonthRevenue > 0
    ? Math.round(((mtdRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
    : 0;

  return { mtdRevenue, mtdNights, adr, revPAN, prevMonthRevenue, changePercent };
}

/* ─── Operations Selectors ─────────────────────────── */

/** Active turnovers (queued or in-progress cleaning tasks) */
export function getActiveTurnovers(state: AppState): OperationsTask[] {
  return state.operationsTasks.filter(
    t => t.type === 'cleaning' && (t.status === 'queued' || t.status === 'in_progress')
  );
}

/** Today's operations tasks */
export function getTodayTasks(state: AppState): OperationsTask[] {
  const today = todayStr();
  return state.operationsTasks.filter(t => t.scheduledDate === today && t.status !== 'completed');
}

/** Overdue operations tasks */
export function getOverdueTasks(state: AppState): OperationsTask[] {
  const today = todayStr();
  return state.operationsTasks.filter(
    t => t.scheduledDate < today && t.status !== 'completed' && t.status !== 'cancelled'
  );
}

/** Priority operations tasks (P0 or P1 that aren't completed) */
export function getPriorityTasks(state: AppState): OperationsTask[] {
  return state.operationsTasks
    .filter(t => (t.priority === 'p0' || t.priority === 'p1') && t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => {
      const pMap = { p0: 0, p1: 1, p2: 2, p3: 3 };
      return (pMap[a.priority] - pMap[b.priority]) || a.scheduledDate.localeCompare(b.scheduledDate);
    });
}

/* ─── Maintenance / Issues ─────────────────────────── */

/** Open maintenance issues (not resolved/closed) */
export function getOpenIssues(state: AppState): MaintenanceIssue[] {
  return state.maintenanceIssues.filter(
    i => i.status !== 'resolved' && i.status !== 'closed'
  );
}

/** Issues by priority */
export function getIssuesByPriority(state: AppState): { urgent: number; high: number; medium: number; low: number } {
  const open = getOpenIssues(state);
  return {
    urgent: open.filter(i => i.priority === 'urgent').length,
    high: open.filter(i => i.priority === 'high').length,
    medium: open.filter(i => i.priority === 'medium').length,
    low: open.filter(i => i.priority === 'low').length,
  };
}

/* ─── Inbox / Messages ─────────────────────────────── */

/** Threads with unread messages */
export function getUnreadThreads(state: AppState): InboxThread[] {
  return state.inboxThreads.filter(t => t.unread > 0);
}

/** Total unread message count */
export function getUnreadCount(state: AppState): number {
  return state.inboxThreads.reduce((sum, t) => sum + t.unread, 0);
}

/** Urgent unread threads */
export function getUrgentMessages(state: AppState): InboxThread[] {
  return state.inboxThreads.filter(t => t.urgent && t.unread > 0);
}

/* ─── Unified Urgent Items ─────────────────────────── */

export interface UrgentSummary {
  unreadMessages: number;
  openIssues: number;
  overdueTasks: number;
  emptyNightsNext7: number;
  urgentIssues: number;
  total: number;
}

/** Combined urgent attention items for dashboard */
export function getUrgentSummary(state: AppState): UrgentSummary {
  const unreadMessages = getUnreadCount(state);
  const issues = getOpenIssues(state);
  const openIssues = issues.length;
  const urgentIssues = issues.filter(i => i.priority === 'urgent').length;
  const overdueTasks = getOverdueTasks(state).length;
  const emptyNightsNext7 = getEmptyNights(state, 7);

  return {
    unreadMessages,
    openIssues,
    overdueTasks,
    emptyNightsNext7,
    urgentIssues,
    total: unreadMessages + openIssues + overdueTasks,
  };
}

/* ─── Recent Activity ──────────────────────────────── */

export interface RecentEvent {
  id: string;
  type: 'booking' | 'message' | 'turnover' | 'issue' | 'pricing';
  title: string;
  detail: string;
  timestamp: string;
  href: string;
}

/** Get recent operational events (synthesized from state) */
export function getRecentActivity(state: AppState, limit: number = 8): RecentEvent[] {
  const events: RecentEvent[] = [];

  // Recent reservations
  state.reservations
    .filter(r => r.bookedAt)
    .forEach(r => {
      const guest = state.guests[r.guestId];
      const guestName = guest ? `${guest.firstName} ${guest.lastName}` : 'Guest';
      events.push({
        id: `res-${r.id}`,
        type: 'booking',
        title: `${r.status === 'cancelled' ? 'Cancelled' : 'Reservation'}: ${guestName}`,
        detail: `${r.totalNights} nights · $${r.total}`,
        timestamp: r.bookedAt,
        href: '/reservations',
      });
    });

  // Recent messages
  state.inboxThreads.forEach(t => {
    if (t.messages.length > 0) {
      const lastMsg = t.messages[t.messages.length - 1];
      const guest = state.guests[t.guestId];
      const guestName = guest ? `${guest.firstName} ${guest.lastName}` : 'Guest';
      events.push({
        id: `msg-${t.id}`,
        type: 'message',
        title: `Message from ${lastMsg.sender === 'guest' ? guestName : 'You'}`,
        detail: lastMsg.text.substring(0, 60) + (lastMsg.text.length > 60 ? '…' : ''),
        timestamp: lastMsg.timestamp,
        href: '/inbox',
      });
    }
  });

  // Completed turnovers
  state.operationsTasks
    .filter(t => t.status === 'completed' && t.completedAt)
    .forEach(t => {
      events.push({
        id: `op-${t.id}`,
        type: 'turnover',
        title: `Completed: ${t.title}`,
        detail: t.assigneeName || 'Self',
        timestamp: t.completedAt!,
        href: '/operations',
      });
    });

  // Resolved issues
  state.maintenanceIssues
    .filter(i => i.resolvedAt)
    .forEach(i => {
      events.push({
        id: `issue-${i.id}`,
        type: 'issue',
        title: `Resolved: ${i.title}`,
        detail: i.resolution || '',
        timestamp: i.resolvedAt!,
        href: '/issues',
      });
    });

  // Sort by timestamp descending, return top N
  return events
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

/* ─── Upcoming Events (Local events affecting pricing) ── */

export function getUpcomingEvents(state: AppState, days: number = 30) {
  const today = todayStr();
  const end = daysFromNow(days);
  return state.localEvents
    .filter(e => e.startDate >= today && e.startDate <= end)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}
