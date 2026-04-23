'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { properties } from '@/data/properties';
import type { ReservationSource } from '@/types';

export function QuickAddReservation({
  initialDate,
  onClose,
  onCreate,
}: {
  initialDate: string;
  onClose: () => void;
  onCreate?: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    guestName: '',
    source: 'direct' as ReservationSource,
    checkIn: initialDate,
    checkOut: '',
    guests: 2,
    nightlyRate: 150,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Quick-add reservation:', formData);
    alert('Reservation creation will be implemented with full context integration');
    onCreate?.(formData);
    onClose();
  };

  const checkInDate = formData.checkIn ? new Date(formData.checkIn) : null;
  const checkOutDate = formData.checkOut ? new Date(formData.checkOut) : null;
  const nights = checkInDate && checkOutDate
    ? Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const total = nights * formData.nightlyRate;

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
            <h2 className="text-xl font-display font-bold text-white">Quick Add Reservation</h2>
            <p className="text-sm text-zinc-500 mt-1">Create booking for {initialDate}</p>
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
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Guest Name *</label>
            <Input
              type="text"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              required
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Source *</label>
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Nightly Rate *</label>
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
          </div>

          {nights > 0 && (
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">{nights} night{nights !== 1 ? 's' : ''} × ${formData.nightlyRate}/night</span>
                <span className="text-xl font-bold text-emerald-400">${total.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
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
