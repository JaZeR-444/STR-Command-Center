'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { properties } from '@/data/properties';
import { PricingCalendar } from '@/components/pricing/pricing-calendar';
import { BulkEditModal } from '@/components/pricing/bulk-edit-modal';
import { PricingRules } from '@/components/pricing/pricing-rules';
import { cn } from '@/lib/utils';
import type { DailyPricing } from '@/types';

export default function PricingPage() {
  const { state } = useApp();
  const { dailyPricing, pricingRules, reservations } = state;
  const [selectedProperty, setSelectedProperty] = useState(properties[0]?.id || '1');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const propertyPricing = dailyPricing.filter(p => p.propertyId === selectedProperty);
  const propertyRules = pricingRules.filter(r => r.propertyId === selectedProperty);
  const propertyReservations = reservations.filter(r => r.propertyId === selectedProperty);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (date: string, pricing?: DailyPricing) => {
    setSelectedDate(date);
    setShowBulkEdit(true);
  };

  const handleBulkEditApply = (data: any) => {
    console.log('Bulk edit apply:', data);
    alert('Bulk pricing update will be implemented with full context integration');
    // TODO: Implement via context method
  };

  const handleRuleToggle = (ruleId: string, enabled: boolean) => {
    console.log('Toggle rule:', ruleId, enabled);
    alert('Pricing rule toggle will be implemented with full context integration');
    // TODO: Implement via context method
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Dynamic Pricing
        </h1>
        <p className="text-zinc-400 text-sm mt-2">Calendar-based pricing with automated rules and bulk updates</p>
      </header>

      {/* Property Selector */}
      {properties.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Property</label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
          >
            {properties.map(property => (
              <option key={property.id} value={property.id}>{property.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="xl:col-span-2">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <h2 className="text-2xl font-display font-bold text-white">{monthName}</h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="ml-2 px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedDate(null);
                setShowBulkEdit(true);
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Bulk Edit
            </button>
          </div>

          <PricingCalendar
            pricing={propertyPricing}
            reservations={propertyReservations}
            month={month}
            year={year}
            onDateClick={handleDateClick}
          />

          {/* Quick Tips */}
          <div className="mt-6 glass rounded-xl border-2 border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Tips
            </h3>
            <ul className="text-xs text-zinc-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 shrink-0">•</span>
                <span>Click any available date to edit pricing for that day or start a bulk edit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 shrink-0">•</span>
                <span>Pricing rules are applied automatically based on priority (lower number = higher priority)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 shrink-0">•</span>
                <span>Weekend rates and event pricing automatically apply when enabled in rules</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 shrink-0">•</span>
                <span>Min/max stay requirements help optimize bookings and revenue</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pricing Rules Section */}
        <div className="xl:col-span-1">
          <PricingRules
            rules={propertyRules}
            onToggle={handleRuleToggle}
          />

          {/* Stats Card */}
          <div className="mt-6 glass rounded-xl border-2 border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Pricing Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-sm text-zinc-400">Active Rules</span>
                <span className="text-lg font-bold text-blue-400">
                  {propertyRules.filter(r => r.enabled).length}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-sm text-zinc-400">Days Priced</span>
                <span className="text-lg font-bold text-emerald-400">
                  {propertyPricing.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Avg Nightly Rate</span>
                <span className="text-lg font-bold text-purple-400">
                  ${propertyPricing.length > 0
                    ? Math.round(propertyPricing.reduce((sum, p) => sum + p.finalPrice, 0) / propertyPricing.length)
                    : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Channel-Specific Pricing (Coming Soon) */}
          <div className="mt-6 glass rounded-xl border-2 border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Channel Pricing</h3>
            <div className="space-y-2 text-xs text-zinc-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF5A5F]"></span>
                  Airbnb
                </span>
                <span>Base rate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#003580]"></span>
                  Booking.com
                </span>
                <span>Base rate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0071C2]"></span>
                  Vrbo
                </span>
                <span>Base rate</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Direct
                </span>
                <span>Base rate - 15%</span>
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-3 italic">
              Channel-specific pricing overrides coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <BulkEditModal
          initialDate={selectedDate || undefined}
          onClose={() => setShowBulkEdit(false)}
          onApply={handleBulkEditApply}
        />
      )}
    </div>
  );
}
