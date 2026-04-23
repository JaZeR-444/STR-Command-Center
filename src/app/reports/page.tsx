'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { properties } from '@/data/properties';
import { RevenueChart } from '@/components/reports/revenue-chart';
import { ChannelBreakdown } from '@/components/reports/channel-breakdown';
import {
  generateMonthlyReports,
  calculateRevenueReport,
  calculateOccupancyReport,
  calculatePerformanceMetrics,
  exportReportAsCSV,
  downloadCSV,
} from '@/lib/report-utils';
import { cn } from '@/lib/utils';

type ReportPeriod = 'month' | 'quarter' | 'year' | 'custom';
type ReportType = 'overview' | 'revenue' | 'occupancy' | 'channels';

export default function ReportsPage() {
  const { state } = useApp();
  const { reservations, dailyPricing } = state;
  const [selectedProperty, setSelectedProperty] = useState(properties[0]?.id || '1');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('month');
  const [activeTab, setActiveTab] = useState<ReportType>('overview');

  // Calculate current period dates
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;
    let label: string;

    if (reportPeriod === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      label = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (reportPeriod === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59);
      label = `Q${quarter + 1} ${now.getFullYear()}`;
    } else if (reportPeriod === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      label = now.getFullYear().toString();
    } else {
      // Custom - last 30 days
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = now;
      label = 'Last 30 Days';
    }

    return { startDate: start, endDate: end, periodLabel: label };
  }, [reportPeriod]);

  // Filter data by property
  const propertyReservations = reservations.filter(r => r.propertyId === selectedProperty);
  const propertyPricing = dailyPricing.filter(p => p.propertyId === selectedProperty);

  // Calculate reports
  const revenueReport = useMemo(
    () => calculateRevenueReport(propertyReservations, startDate, endDate),
    [propertyReservations, startDate, endDate]
  );

  const occupancyReport = useMemo(
    () => calculateOccupancyReport(propertyReservations, startDate, endDate),
    [propertyReservations, startDate, endDate]
  );

  const performanceMetrics = useMemo(
    () => calculatePerformanceMetrics(propertyReservations, propertyPricing, startDate, endDate),
    [propertyReservations, propertyPricing, startDate, endDate]
  );

  const monthlyReports = useMemo(
    () => generateMonthlyReports(propertyReservations, 6),
    [propertyReservations]
  );

  // Export handlers
  const handleExportRevenue = () => {
    const csv = exportReportAsCSV(revenueReport, 'revenue');
    downloadCSV(csv, `revenue-report-${periodLabel.replace(/\s+/g, '-')}.csv`);
  };

  const handleExportOccupancy = () => {
    const csv = exportReportAsCSV(occupancyReport, 'occupancy');
    downloadCSV(csv, `occupancy-report-${periodLabel.replace(/\s+/g, '-')}.csv`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          Reports & Analytics
        </h1>
        <p className="text-zinc-400 text-sm mt-2">Revenue, occupancy, and performance tracking</p>
      </header>

      {/* Controls */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Property Selector */}
          {properties.length > 1 && (
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-500 mb-2">Property</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {properties.map(property => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Period Selector */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-500 mb-2">Period</label>
            <div className="flex gap-2">
              {[
                { value: 'month', label: 'Month' },
                { value: 'quarter', label: 'Quarter' },
                { value: 'year', label: 'Year' },
                { value: 'custom', label: '30 Days' },
              ].map(period => (
                <button
                  key={period.value}
                  onClick={() => setReportPeriod(period.value as ReportPeriod)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                    reportPeriod === period.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex items-end">
            <button
              onClick={activeTab === 'revenue' ? handleExportRevenue : handleExportOccupancy}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Period Label */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-sm text-zinc-400">
            Showing data for: <span className="font-semibold text-white">{periodLabel}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { value: 'overview', label: 'Overview', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z' },
          { value: 'revenue', label: 'Revenue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { value: 'occupancy', label: 'Occupancy', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { value: 'channels', label: 'Channels', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as ReportType)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap',
              activeTab === tab.value
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            )}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d={tab.icon} clipRule="evenodd"/>
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass rounded-xl border-2 border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">Total Revenue</p>
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">${performanceMetrics.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-zinc-600 mt-1">
                +${performanceMetrics.projectedRevenue.toLocaleString()} projected
              </p>
            </div>

            <div className="glass rounded-xl border-2 border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">Occupancy Rate</p>
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{performanceMetrics.occupancyRate}%</p>
              <p className="text-xs text-zinc-600 mt-1">
                {occupancyReport.bookedNights}/{occupancyReport.totalNights} nights
              </p>
            </div>

            <div className="glass rounded-xl border-2 border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">ADR</p>
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">${performanceMetrics.adr}</p>
              <p className="text-xs text-zinc-600 mt-1">Average Daily Rate</p>
            </div>

            <div className="glass rounded-xl border-2 border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">RevPAN</p>
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">${performanceMetrics.revPAR}</p>
              <p className="text-xs text-zinc-600 mt-1">Revenue Per Available Night</p>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="glass rounded-xl border-2 border-zinc-800 p-6">
            <h2 className="text-lg font-display font-bold text-white mb-4">Revenue Trend (Last 6 Months)</h2>
            <RevenueChart
              data={monthlyReports.map(r => ({
                label: r.period,
                value: r.totalRevenue,
              }))}
              height={250}
            />
          </div>

          {/* Channel Performance */}
          <div className="glass rounded-xl border-2 border-zinc-800 p-6">
            <h2 className="text-lg font-display font-bold text-white mb-4">Channel Performance</h2>
            <ChannelBreakdown data={revenueReport.channelBreakdown} />
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="glass rounded-xl border-2 border-zinc-800 p-6">
            <h2 className="text-lg font-display font-bold text-white mb-4">Revenue Report - {periodLabel}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-400">${revenueReport.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Bookings</p>
                <p className="text-3xl font-bold text-white">{revenueReport.bookingCount}</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Avg Booking Value</p>
                <p className="text-3xl font-bold text-blue-400">${revenueReport.avgBookingValue.toFixed(0)}</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Nights Booked</p>
                <p className="text-3xl font-bold text-white">{revenueReport.nightsBooked}</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Avg Nightly Rate</p>
                <p className="text-3xl font-bold text-purple-400">${revenueReport.avgNightlyRate.toFixed(0)}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4">Channel Breakdown</h3>
              <ChannelBreakdown data={revenueReport.channelBreakdown} />
            </div>
          </div>

          <div className="glass rounded-xl border-2 border-zinc-800 p-6">
            <h2 className="text-lg font-display font-bold text-white mb-4">Revenue Trend</h2>
            <RevenueChart
              data={monthlyReports.map(r => ({
                label: r.period,
                value: r.totalRevenue,
              }))}
              height={250}
            />
          </div>
        </div>
      )}

      {activeTab === 'occupancy' && (
        <div className="space-y-6">
          <div className="glass rounded-xl border-2 border-zinc-800 p-6">
            <h2 className="text-lg font-display font-bold text-white mb-4">Occupancy Report - {periodLabel}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Occupancy Rate</p>
                <p className="text-3xl font-bold text-blue-400">{occupancyReport.occupancyRate.toFixed(1)}%</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Booked Nights</p>
                <p className="text-3xl font-bold text-emerald-400">{occupancyReport.bookedNights}</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Available Nights</p>
                <p className="text-3xl font-bold text-amber-400">{occupancyReport.availableNights}</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">RevPAN</p>
                <p className="text-3xl font-bold text-purple-400">${occupancyReport.revenuePerAvailableNight.toFixed(0)}</p>
              </div>
            </div>

            {/* Visual occupancy bar */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">Occupancy Visualization</h3>
              <div className="h-12 rounded-lg overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center text-white text-sm font-semibold"
                  style={{ width: `${occupancyReport.occupancyRate}%` }}
                >
                  {occupancyReport.occupancyRate > 15 && `${occupancyReport.occupancyRate.toFixed(0)}% Booked`}
                </div>
                <div className="bg-zinc-800 flex-1 flex items-center justify-center text-zinc-500 text-sm">
                  {occupancyReport.occupancyRate <= 85 && `${(100 - occupancyReport.occupancyRate).toFixed(0)}% Available`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="glass rounded-xl border-2 border-zinc-800 p-6">
            <h2 className="text-lg font-display font-bold text-white mb-4">Channel Performance - {periodLabel}</h2>
            <ChannelBreakdown data={revenueReport.channelBreakdown} />
          </div>

          {/* Channel comparison table */}
          <div className="glass rounded-xl border-2 border-zinc-800 p-6">
            <h2 className="text-lg font-display font-bold text-white mb-4">Detailed Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-2 text-zinc-400 font-semibold">Channel</th>
                    <th className="text-right py-3 px-2 text-zinc-400 font-semibold">Revenue</th>
                    <th className="text-right py-3 px-2 text-zinc-400 font-semibold">Bookings</th>
                    <th className="text-right py-3 px-2 text-zinc-400 font-semibold">Avg/Booking</th>
                    <th className="text-right py-3 px-2 text-zinc-400 font-semibold">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueReport.channelBreakdown.map((channel, index) => (
                    <tr key={index} className="border-b border-zinc-800/50 hover:bg-zinc-900/30">
                      <td className="py-3 px-2">
                        <span className="font-semibold text-white capitalize">{channel.channel}</span>
                      </td>
                      <td className="text-right py-3 px-2 text-emerald-400 font-semibold">
                        ${channel.revenue.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-2 text-white">
                        {channel.bookings}
                      </td>
                      <td className="text-right py-3 px-2 text-blue-400">
                        ${(channel.revenue / channel.bookings).toFixed(0)}
                      </td>
                      <td className="text-right py-3 px-2 text-purple-400 font-semibold">
                        {channel.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
