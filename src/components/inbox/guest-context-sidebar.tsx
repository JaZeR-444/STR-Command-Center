'use client';

import { properties } from '@/data/properties';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AppState, InboxThread, GuestProfile, Reservation } from '@/types';

export function GuestContextSidebar({
  thread,
  state,
}: {
  thread: InboxThread;
  state: AppState;
}) {
  const guest = state.guests[thread.guestId];
  const reservation = thread.reservationId
    ? state.reservations.find(r => r.id === thread.reservationId)
    : null;
  const property = reservation
    ? properties.find(p => p.id === reservation.propertyId)
    : null;

  if (!guest) {
    return (
      <div className="p-6 text-center text-zinc-500">
        <p className="text-sm">Guest information not available</p>
      </div>
    );
  }

  const checkInDate = reservation ? new Date(reservation.checkIn) : null;
  const checkOutDate = reservation ? new Date(reservation.checkOut) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Guest Info */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Guest</h3>
        <div className="space-y-3">
          <div>
            <p className="text-lg font-semibold text-white">
              {guest.firstName} {guest.lastName}
            </p>
            {guest.verified && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>

          {guest.email && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">Email</p>
              <p className="text-sm text-zinc-300">{guest.email}</p>
            </div>
          )}

          {guest.phone && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">Phone</p>
              <p className="text-sm text-zinc-300">{guest.phone}</p>
            </div>
          )}

          <div className="flex gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Total Trips</p>
              <p className="text-sm font-semibold text-white">{guest.totalTrips}</p>
            </div>
            {guest.rating && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Rating</p>
                <p className="text-sm font-semibold text-emerald-400">{guest.rating} ⭐</p>
              </div>
            )}
          </div>

          {guest.notes && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-400 font-semibold mb-1">Notes</p>
              <p className="text-xs text-zinc-300">{guest.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reservation Info */}
      {reservation && (
        <>
          <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Current Reservation</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Property</p>
                <p className="text-sm font-semibold text-white">{property?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Check-in</p>
                  <p className="text-sm font-semibold text-white">
                    {checkInDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <p className="text-xs text-zinc-500 mb-1">Check-out</p>
                  <p className="text-sm font-semibold text-white">
                    {checkOutDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">{reservation.totalNights} nights · {reservation.guests} guests</span>
                <span className="text-base font-bold text-emerald-400">${reservation.total.toLocaleString()}</span>
              </div>

              <Badge variant="status" status={reservation.status as any}>
                {reservation.status.replace('_', ' ')}
              </Badge>

              {reservation.specialRequests && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-xs text-amber-400 font-semibold mb-1">Special Requests</p>
                  <p className="text-xs text-zinc-300">{reservation.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="border-t border-zinc-800 pt-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm text-zinc-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            View on Calendar
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm text-zinc-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1"/>
            </svg>
            View Reservation
          </button>
        </div>
      </div>
    </div>
  );
}
