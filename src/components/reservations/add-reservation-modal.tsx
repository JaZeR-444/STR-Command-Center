'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { properties } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ReservationSource, ReservationStatus } from '@/types';

export function AddReservationModal({ onClose }: { onClose: () => void }) {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    propertyId: properties[0]?.id || '1',
    guestFirstName: '',
    guestLastName: '',
    guestEmail: '',
    guestPhone: '',
    source: 'direct' as ReservationSource,
    checkIn: '',
    checkOut: '',
    guests: 2,
    nightlyRate: 150,
    cleaningFee: 75,
    serviceFee: 0,
    taxes: 0,
    specialRequests: '',
  });

  const calculateTotals = () => {
    if (!formData.checkIn || !formData.checkOut) return { nights: 0, subtotal: 0, total: 0 };

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const subtotal = nights * formData.nightlyRate;
    const total = subtotal + formData.cleaningFee + formData.serviceFee + formData.taxes;

    return { nights, subtotal, total };
  };

  const { nights, subtotal, total } = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Implement actual reservation creation via context
    // This would involve:
    // 1. Creating a guest profile if new
    // 2. Creating the reservation record
    // 3. Auto-creating a turnover task for the checkout date

    console.log('Creating reservation:', formData);
    alert('Reservation creation not yet implemented - coming in Phase 1 completion');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl border-2 border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Add Reservation</h2>
            <p className="text-sm text-zinc-500 mt-1">Manually create a new booking</p>
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
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

          {/* Property & Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Property</label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as ReservationSource })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking.com</option>
                <option value="vrbo">Vrbo</option>
                <option value="direct">Direct</option>
              </select>
            </div>
          </div>

          {/* Guest Info */}
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300">Guest Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">First Name *</label>
                <Input
                  type="text"
                  value={formData.guestFirstName}
                  onChange={(e) => setFormData({ ...formData, guestFirstName: e.target.value })}
                  required
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Last Name *</label>
                <Input
                  type="text"
                  value={formData.guestLastName}
                  onChange={(e) => setFormData({ ...formData, guestLastName: e.target.value })}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Phone</label>
                <Input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  placeholder="+1 555-0123"
                />
              </div>
            </div>
          </div>

          {/* Dates & Guests */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Check-in *</label>
              <Input
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Check-out *</label>
              <Input
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Guests *</label>
              <Input
                type="number"
                min="1"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Nightly Rate *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <Input
                    type="number"
                    min="0"
                    value={formData.nightlyRate}
                    onChange={(e) => setFormData({ ...formData, nightlyRate: parseFloat(e.target.value) })}
                    className="pl-7"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Cleaning Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <Input
                    type="number"
                    min="0"
                    value={formData.cleaningFee}
                    onChange={(e) => setFormData({ ...formData, cleaningFee: parseFloat(e.target.value) })}
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Service Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <Input
                    type="number"
                    min="0"
                    value={formData.serviceFee}
                    onChange={(e) => setFormData({ ...formData, serviceFee: parseFloat(e.target.value) })}
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Taxes</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <Input
                    type="number"
                    min="0"
                    value={formData.taxes}
                    onChange={(e) => setFormData({ ...formData, taxes: parseFloat(e.target.value) })}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            {/* Price Summary */}
            {nights > 0 && (
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>${formData.nightlyRate}/night × {nights} nights</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-emerald-400">${total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Special Requests</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Early check-in, extra towels, etc."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Create Reservation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
