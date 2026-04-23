// Utilities for calculating report metrics
import type { Reservation, DailyPricing } from '@/types';

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  bookingCount: number;
  avgBookingValue: number;
  nightsBooked: number;
  avgNightlyRate: number;
  channelBreakdown: {
    channel: string;
    revenue: number;
    bookings: number;
    percentage: number;
  }[];
}

export interface OccupancyReport {
  period: string;
  totalNights: number;
  bookedNights: number;
  availableNights: number;
  occupancyRate: number;
  revenuePerAvailableNight: number;
}

export interface PerformanceMetrics {
  adr: number; // Average Daily Rate
  revPAR: number; // Revenue Per Available Room (night)
  totalRevenue: number;
  projectedRevenue: number;
  occupancyRate: number;
}

/**
 * Calculate revenue report for a given period
 */
export function calculateRevenueReport(
  reservations: Reservation[],
  startDate: Date,
  endDate: Date
): RevenueReport {
  const periodReservations = reservations.filter(r => {
    const checkIn = new Date(r.checkIn);
    const checkOut = new Date(r.checkOut);
    // Include if any part of the reservation overlaps with the period
    return checkOut >= startDate && checkIn <= endDate;
  });

  const totalRevenue = periodReservations.reduce((sum, r) => sum + r.total, 0);
  const bookingCount = periodReservations.length;
  const avgBookingValue = bookingCount > 0 ? totalRevenue / bookingCount : 0;
  const nightsBooked = periodReservations.reduce((sum, r) => sum + r.totalNights, 0);
  const avgNightlyRate = nightsBooked > 0 ? totalRevenue / nightsBooked : 0;

  // Channel breakdown
  const channelStats: Record<string, { revenue: number; bookings: number }> = {};
  periodReservations.forEach(r => {
    if (!channelStats[r.source]) {
      channelStats[r.source] = { revenue: 0, bookings: 0 };
    }
    channelStats[r.source].revenue += r.total;
    channelStats[r.source].bookings += 1;
  });

  const channelBreakdown = Object.entries(channelStats).map(([channel, stats]) => ({
    channel,
    revenue: stats.revenue,
    bookings: stats.bookings,
    percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
  })).sort((a, b) => b.revenue - a.revenue);

  return {
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    totalRevenue,
    bookingCount,
    avgBookingValue,
    nightsBooked,
    avgNightlyRate,
    channelBreakdown,
  };
}

/**
 * Calculate occupancy report for a given period
 */
export function calculateOccupancyReport(
  reservations: Reservation[],
  startDate: Date,
  endDate: Date
): OccupancyReport {
  const totalNights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Count booked nights within the period
  let bookedNights = 0;
  reservations.forEach(r => {
    const checkIn = new Date(r.checkIn);
    const checkOut = new Date(r.checkOut);

    // Calculate overlap
    const overlapStart = checkIn > startDate ? checkIn : startDate;
    const overlapEnd = checkOut < endDate ? checkOut : endDate;

    if (overlapStart < overlapEnd) {
      const nights = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
      bookedNights += nights;
    }
  });

  const availableNights = totalNights - bookedNights;
  const occupancyRate = totalNights > 0 ? (bookedNights / totalNights) * 100 : 0;

  const totalRevenue = reservations
    .filter(r => {
      const checkIn = new Date(r.checkIn);
      const checkOut = new Date(r.checkOut);
      return checkOut >= startDate && checkIn <= endDate;
    })
    .reduce((sum, r) => sum + r.total, 0);

  const revenuePerAvailableNight = totalNights > 0 ? totalRevenue / totalNights : 0;

  return {
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    totalNights,
    bookedNights,
    availableNights,
    occupancyRate,
    revenuePerAvailableNight,
  };
}

/**
 * Calculate performance metrics for a given period
 */
export function calculatePerformanceMetrics(
  reservations: Reservation[],
  pricing: DailyPricing[],
  startDate: Date,
  endDate: Date
): PerformanceMetrics {
  const occupancy = calculateOccupancyReport(reservations, startDate, endDate);
  const revenue = calculateRevenueReport(reservations, startDate, endDate);

  const adr = revenue.avgNightlyRate;
  const revPAR = occupancy.revenuePerAvailableNight;

  // Calculate projected revenue based on current pricing for available nights
  const projectedRevenue = pricing
    .filter(p => {
      const date = new Date(p.date);
      return date >= startDate && date <= endDate && p.available && !p.booked;
    })
    .reduce((sum, p) => sum + p.finalPrice, 0);

  return {
    adr: Math.round(adr),
    revPAR: Math.round(revPAR),
    totalRevenue: revenue.totalRevenue,
    projectedRevenue: Math.round(projectedRevenue),
    occupancyRate: Math.round(occupancy.occupancyRate),
  };
}

/**
 * Generate monthly reports for the last N months
 */
export function generateMonthlyReports(
  reservations: Reservation[],
  months: number = 6
): RevenueReport[] {
  const reports: RevenueReport[] = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const startDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);

    const report = calculateRevenueReport(reservations, startDate, endDate);
    report.period = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    reports.push(report);
  }

  return reports;
}

/**
 * Export report data as CSV
 */
export function exportReportAsCSV(report: RevenueReport | OccupancyReport, type: 'revenue' | 'occupancy'): string {
  if (type === 'revenue') {
    const r = report as RevenueReport;
    let csv = 'Period,Total Revenue,Bookings,Avg Booking Value,Nights Booked,Avg Nightly Rate\n';
    csv += `${r.period},${r.totalRevenue},${r.bookingCount},${r.avgBookingValue.toFixed(2)},${r.nightsBooked},${r.avgNightlyRate.toFixed(2)}\n\n`;
    csv += 'Channel Breakdown\n';
    csv += 'Channel,Revenue,Bookings,Percentage\n';
    r.channelBreakdown.forEach(ch => {
      csv += `${ch.channel},${ch.revenue},${ch.bookings},${ch.percentage.toFixed(1)}%\n`;
    });
    return csv;
  } else {
    const r = report as OccupancyReport;
    let csv = 'Period,Total Nights,Booked Nights,Available Nights,Occupancy Rate,RevPAN\n';
    csv += `${r.period},${r.totalNights},${r.bookedNights},${r.availableNights},${r.occupancyRate.toFixed(1)}%,${r.revenuePerAvailableNight.toFixed(2)}\n`;
    return csv;
  }
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
