'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PricingStrategy } from '@/types';

export function BulkEditModal({
  initialDate,
  onClose,
  onApply,
}: {
  initialDate?: string;
  onClose: () => void;
  onApply?: (data: {
    startDate: string;
    endDate: string;
    basePrice: number;
    minStay: number;
    maxStay?: number;
    strategy: PricingStrategy;
    strategyLabel: string;
  }) => void;
}) {
  const [formData, setFormData] = useState({
    startDate: initialDate || '',
    endDate: '',
    basePrice: 195,
    minStay: 1,
    maxStay: undefined as number | undefined,
    strategy: 'custom' as PricingStrategy,
    strategyLabel: 'Custom Pricing',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply?.(formData);
    onClose();
  };

  const startDate = formData.startDate ? new Date(formData.startDate) : null;
  const endDate = formData.endDate ? new Date(formData.endDate) : null;
  const nights = startDate && endDate
    ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))) + 1
    : 0;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl border-2 border-zinc-800 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-white">Bulk Edit Pricing</h2>
            <p className="text-sm text-zinc-500 mt-1">Update pricing for a date range</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Start Date *</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">End Date *</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                min={formData.startDate}
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-zinc-300">
                Updating <span className="font-bold text-blue-400">{nights} nights</span>
              </p>
            </div>
          )}

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Nightly Rate *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <Input
                  type="number"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                  className="pl-7"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Min Stay (nights) *</label>
              <Input
                type="number"
                min="1"
                value={formData.minStay}
                onChange={(e) => setFormData({ ...formData, minStay: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Optional Max Stay */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Max Stay (nights)</label>
            <Input
              type="number"
              min="1"
              value={formData.maxStay || ''}
              onChange={(e) => setFormData({ ...formData, maxStay: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="No limit"
            />
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Pricing Strategy *</label>
            <select
              value={formData.strategy}
              onChange={(e) => {
                const strategy = e.target.value as PricingStrategy;
                let label = 'Custom Pricing';
                if (strategy === 'weekend') label = 'Weekend Rate';
                if (strategy === 'event') label = 'Event Pricing';
                if (strategy === 'seasonal') label = 'Seasonal Rate';
                if (strategy === 'last_minute') label = 'Last Minute Discount';
                if (strategy === 'orphan_gap') label = 'Orphan Gap Fill';
                setFormData({ ...formData, strategy, strategyLabel: label });
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">Custom</option>
              <option value="base">Base Rate</option>
              <option value="weekend">Weekend Premium</option>
              <option value="event">Event Pricing</option>
              <option value="seasonal">Seasonal Rate</option>
              <option value="last_minute">Last Minute Discount</option>
              <option value="orphan_gap">Orphan Gap Fill</option>
            </select>
          </div>

          {/* Strategy Label */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Label</label>
            <Input
              type="text"
              value={formData.strategyLabel}
              onChange={(e) => setFormData({ ...formData, strategyLabel: e.target.value })}
              placeholder="e.g., SXSW Festival, Summer High Season"
            />
          </div>

          {/* Preview */}
          {nights > 0 && (
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">Total potential revenue:</span>
                <span className="text-xl font-bold text-emerald-400">
                  ${(formData.basePrice * nights).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-zinc-600">
                {nights} nights × ${formData.basePrice}/night
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Apply Pricing
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
