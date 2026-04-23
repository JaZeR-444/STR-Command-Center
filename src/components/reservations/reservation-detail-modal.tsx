'use client';

import { useApp } from '@/lib/context';
import { properties } from '@/data/properties';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/types';

const channelColors = {
  airbnb: 'bg-[#FF5A5F] text-white',
  booking: 'bg-[#003580] text-white',
  vrbo: 'bg-[#0071C2] text-white',
  direct: 'bg-purple-600 text-white',
};

const channelIcons = {
  airbnb: '🏠',
  booking: '🅱️',
  vrbo: '🏖️',
  direct: '📧',
};

const statusColors = {
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  checked_in: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  checked_out: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function ReservationDetailModal({
  reservation,
  onClose,
}: {
  reservation: Reservation;
  onClose: () => void;
}) {
  const { state } = useApp();
  const guest = state.guests[reservation.guestId];
  const property = properties.find(p => p.id === reservation.propertyId);

  const checkInDate = new Date(reservation.checkIn);
  const checkOutDate = new Date(reservation.checkOut);
  const bookedDate = new Date(reservation.bookedAt);

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
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-6 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('px-2 py-1 rounded text-xs font-bold', channelColors[reservation.source])}>
                {channelIcons[reservation.source]} {reservation.source.toUpperCase()}
              </span>
              <span className={cn('px-2 py-1 rounded text-xs font-bold border', statusColors[reservation.status])}>
                {reservation.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
              {guest ? `${guest.firstName} ${guest.lastName}` : 'Guest'}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {property?.name || 'Property'} · {reservation.totalNights} night{reservation.totalNights !== 1 ? 's' : ''}
            </p>
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

        {/* Content */}
        <div className="px-6 py-6 space-y-6">

          {/* Dates Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Check-in</p>
              <p className="text-2xl font-bold text-white">
                {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-sm text-zinc-400">
                {checkInDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
              <p className="text-xs text-zinc-600 mt-1">{property?.checkInTime || '3:00 PM'}</p>
            </div>

            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Check-out</p>
              <p className="text-2xl font-bold text-white">
                {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-sm text-zinc-400">
                {checkOutDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
              <p className="text-xs text-zinc-600 mt-1">{property?.checkOutTime || '11:00 AM'}</p>
            </div>
          </div>

          {/* Guest Info */}
          {guest && (
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Guest Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Email</p>
                  <p className="text-sm text-zinc-200">{guest.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Phone</p>
                  <p className="text-sm text-zinc-200">{guest.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Guests</p>
                  <p className="text-sm text-zinc-200">{reservation.guests} guest{reservation.guests !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Platform</p>
                  <p className="text-sm text-zinc-200">{guest.source}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pricing Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">${reservation.nightlyRate}/night × {reservation.totalNights} nights</span>
                <span className="text-zinc-200 font-medium">${reservation.subtotal.toLocaleString()}</span>
              </div>
              {reservation.cleaningFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Cleaning fee</span>
                  <span className="text-zinc-200 font-medium">${reservation.cleaningFee.toLocaleString()}</span>
                </div>
              )}
              {reservation.serviceFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Service fee</span>
                  <span className="text-zinc-200 font-medium">${reservation.serviceFee.toLocaleString()}</span>
                </div>
              )}
              {reservation.taxes > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Taxes</span>
                  <span className="text-zinc-200 font-medium">${reservation.taxes.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-zinc-800 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-white">Total</span>
                  <span className="text-2xl font-bold text-emerald-400">${reservation.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {reservation.specialRequests && (
            <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
              <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Special Requests
              </h3>
              <p className="text-sm text-zinc-300">{reservation.specialRequests}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <span>Booked: {bookedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            {reservation.confirmationCode && (
              <>
                <span>·</span>
                <span>Confirmation: {reservation.confirmationCode}</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <Button variant="primary" className="flex-1" onClick={() => {
              // TODO: Navigate to calendar on this date
              onClose();
            }}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              View on Calendar
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => {
              // TODO: Open inbox with this guest
              onClose();
            }}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Message Guest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
