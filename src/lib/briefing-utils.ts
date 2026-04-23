// Morning briefing calculations and utilities
import type { AppState, Reservation, OperationsTask, MaintenanceIssue, InboxThread, LocalEvent } from '@/types';

export interface DailyBriefing {
  date: string;
  summary: {
    checkIns: number;
    checkOuts: number;
    tasksToday: number;
    urgentIssues: number;
    unreadMessages: number;
    eventsToday: number;
  };
  checkIns: Reservation[];
  checkOuts: Reservation[];
  tasksToday: OperationsTask[];
  urgentIssues: MaintenanceIssue[];
  unreadThreads: InboxThread[];
  eventsToday: LocalEvent[];
  actionItems: {
    type: 'urgent' | 'important' | 'reminder';
    title: string;
    description: string;
    link?: string;
  }[];
  metrics: {
    occupancyToday: number;
    revenueToday: number;
    avgRating: number;
    responseRate: number;
  };
}

export function generateDailyBriefing(state: AppState, date: Date = new Date()): DailyBriefing {
  const today = date.toISOString().split('T')[0];
  const todayStart = new Date(today);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // Check-ins today
  const checkIns = state.reservations.filter(r =>
    r.checkIn === today && r.status !== 'cancelled'
  );

  // Check-outs today
  const checkOuts = state.reservations.filter(r =>
    r.checkOut === today && r.status !== 'cancelled'
  );

  // Tasks scheduled for today
  const tasksToday = state.operationsTasks.filter(t =>
    t.scheduledDate === today && t.status !== 'completed' && t.status !== 'cancelled'
  );

  // Urgent maintenance issues (not resolved/closed)
  const urgentIssues = state.maintenanceIssues.filter(i =>
    i.priority === 'urgent' && i.status !== 'resolved' && i.status !== 'closed'
  );

  // Unread message threads
  const unreadThreads = state.inboxThreads.filter(t =>
    t.unread > 0 && !t.resolved
  );

  // Events happening today
  const eventsToday = state.localEvents.filter(e => {
    const eventStart = new Date(e.startDate);
    const eventEnd = new Date(e.endDate);
    return eventStart <= todayEnd && eventEnd >= todayStart;
  });

  // Generate action items
  const actionItems: DailyBriefing['actionItems'] = [];

  // Urgent: P0 tasks
  const p0Tasks = tasksToday.filter(t => t.priority === 'p0');
  if (p0Tasks.length > 0) {
    actionItems.push({
      type: 'urgent',
      title: `${p0Tasks.length} Critical Task${p0Tasks.length > 1 ? 's' : ''} Today`,
      description: p0Tasks.map(t => t.title).join(', '),
      link: '/operations',
    });
  }

  // Urgent: Maintenance issues
  if (urgentIssues.length > 0) {
    actionItems.push({
      type: 'urgent',
      title: `${urgentIssues.length} Urgent Issue${urgentIssues.length > 1 ? 's' : ''}`,
      description: urgentIssues.map(i => i.title).join(', '),
      link: '/issues',
    });
  }

  // Important: Check-ins with early arrival requests
  const earlyCheckIns = checkIns.filter(r => r.earlyCheckIn);
  if (earlyCheckIns.length > 0) {
    actionItems.push({
      type: 'important',
      title: `${earlyCheckIns.length} Early Check-In Request${earlyCheckIns.length > 1 ? 's' : ''}`,
      description: 'Guests requesting early check-in today',
      link: '/reservations',
    });
  }

  // Important: Unread urgent messages
  const urgentThreads = unreadThreads.filter(t => t.urgent);
  if (urgentThreads.length > 0) {
    actionItems.push({
      type: 'important',
      title: `${urgentThreads.length} Urgent Message${urgentThreads.length > 1 ? 's' : ''}`,
      description: 'Unread urgent guest messages',
      link: '/inbox',
    });
  }

  // Reminder: Check-ins today
  if (checkIns.length > 0) {
    actionItems.push({
      type: 'reminder',
      title: `${checkIns.length} Guest${checkIns.length > 1 ? 's' : ''} Arriving Today`,
      description: 'Ensure properties are ready for check-in',
      link: '/reservations',
    });
  }

  // Reminder: High-impact events
  const highImpactEvents = eventsToday.filter(e => e.impact === 'extreme' || e.impact === 'high');
  if (highImpactEvents.length > 0) {
    actionItems.push({
      type: 'reminder',
      title: `${highImpactEvents.length} Major Event${highImpactEvents.length > 1 ? 's' : ''} Today`,
      description: highImpactEvents.map(e => e.name).join(', '),
      link: '/market',
    });
  }

  // Calculate metrics
  const occupiedProperties = state.reservations.filter(r => {
    const checkIn = new Date(r.checkIn);
    const checkOut = new Date(r.checkOut);
    return checkIn <= todayEnd && checkOut > todayStart && r.status !== 'cancelled';
  }).length;

  const revenueToday = checkIns.reduce((sum, r) => sum + r.total, 0);

  // Get recent ratings (from last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentReservations = state.reservations.filter(r =>
    new Date(r.checkOut) >= thirtyDaysAgo && r.status === 'checked_out'
  );
  const guestRatings = recentReservations.map(r => {
    const guest = state.guests[r.guestId];
    return guest?.rating || 0;
  }).filter(r => r > 0);
  const avgRating = guestRatings.length > 0
    ? guestRatings.reduce((sum, r) => sum + r, 0) / guestRatings.length
    : 0;

  // Response rate (threads with at least one host message / total threads)
  const totalThreads = state.inboxThreads.length;
  const respondedThreads = state.inboxThreads.filter(t =>
    t.messages.some(m => m.sender === 'host')
  ).length;
  const responseRate = totalThreads > 0 ? (respondedThreads / totalThreads) * 100 : 100;

  return {
    date: today,
    summary: {
      checkIns: checkIns.length,
      checkOuts: checkOuts.length,
      tasksToday: tasksToday.length,
      urgentIssues: urgentIssues.length,
      unreadMessages: unreadThreads.reduce((sum, t) => sum + t.unread, 0),
      eventsToday: eventsToday.length,
    },
    checkIns,
    checkOuts,
    tasksToday,
    urgentIssues,
    unreadThreads,
    eventsToday,
    actionItems,
    metrics: {
      occupancyToday: occupiedProperties,
      revenueToday,
      avgRating,
      responseRate,
    },
  };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatDateForBriefing(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
