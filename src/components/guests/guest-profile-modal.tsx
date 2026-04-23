'use client';

import { useMemo } from 'react';
import { properties } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GuestProfile, Reservation, InboxThread, AppState } from '@/types';

const sourceColors = {
  airbnb: '#FF5A5F',
  booking: '#003580',
  vrbo: '#0071C2',
  direct: '#8B5CF6',
};

export function GuestProfileModal({
  guest,
  state,
  onClose,
}: {
  guest: GuestProfile;
  state: AppState;
  onClose: () => void;
}) {
  // Get guest's reservations
  const guestReservations = useMemo(() => {
    return state.reservations
      .filter(r => r.guestId === guest.id)
      .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
  }, [state.reservations, guest.id]);

  // Get guest's messages
  const guestThreads = useMemo(() => {
    return state.inboxThreads.filter(t => t.guestId === guest.id);
  }, [state.inboxThreads, guest.id]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSpent = guestReservations.reduce((sum, r) => sum + r.total, 0);
    const totalNights = guestReservations.reduce((sum, r) => sum + r.totalNights, 0);
    const avgNightlyRate = totalNights > 0 ? totalSpent / totalNights : 0;
    const upcomingReservations = guestReservations.filter(r => r.status === 'upcoming').length;

    return {
      totalSpent,
      totalNights,
      avgNightlyRate,
      upcomingReservations,
    };
  }, [guestReservations]);

  const hasVIP = guest.flags?.includes('vip');

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl border-2 border-zinc-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 glass px-6 py-4 border-b border-zinc-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold',
              hasVIP ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' : 'bg-zinc-800 text-zinc-300'
            )}>
              {guest.firstName[0]}{guest.lastName[0]}
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                {guest.firstName} {guest.lastName}
                {guest.verified && (
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                )}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-zinc-400 capitalize">
                  {guest.source} Guest
                </p>
                {guest.flags && guest.flags.length > 0 && (
                  <div className="flex gap-1">
                    {guest.flags.map((flag, index) => (
                      <span
                        key={index}
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium uppercase',
                          flag === 'vip' && 'bg-amber-500/20 text-amber-400',
                          flag === 'repeat' && 'bg-blue-500/20 text-blue-400',
                          flag === 'problematic' && 'bg-red-500/20 text-red-400'
                        )}
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-emerald-400">${stats.totalSpent.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Total Trips</p>
              <p className="text-2xl font-bold text-white">{guest.totalTrips}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Total Nights</p>
              <p className="text-2xl font-bold text-blue-400">{stats.totalNights}</p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Avg Nightly</p>
              <p className="text-2xl font-bold text-purple-400">${stats.avgNightlyRate.toFixed(0)}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Contact Information</h3>
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {guest.email && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Email</p>
                    <p className="text-sm text-zinc-200">{guest.email}</p>
                  </div>
                )}
                {guest.phone && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Phone</p>
                    <p className="text-sm text-zinc-200">{guest.phone}</p>
                  </div>
                )}
                {guest.language && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Language</p>
                    <p className="text-sm text-zinc-200 capitalize">{guest.language}</p>
                  </div>
                )}
                {guest.timezone && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Timezone</p>
                    <p className="text-sm text-zinc-200">{guest.timezone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          {guest.preferences && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Preferences</h3>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {guest.preferences.bedding && (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-zinc-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg>
                      <div>
                        <p className="text-xs text-zinc-500">Bedding</p>
                        <p className="text-sm text-zinc-200">{guest.preferences.bedding}</p>
                      </div>
                    </div>
                  )}
                  {guest.preferences.temperature && (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-zinc-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
                      </svg>
                      <div>
                        <p className="text-xs text-zinc-500">Temperature</p>
                        <p className="text-sm text-zinc-200">{guest.preferences.temperature}</p>
                      </div>
                    </div>
                  )}
                  {guest.preferences.checkInTime && (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-zinc-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <div>
                        <p className="text-xs text-zinc-500">Check-in</p>
                        <p className="text-sm text-zinc-200">{guest.preferences.checkInTime}</p>
                      </div>
                    </div>
                  )}
                  {guest.preferences.specialRequests && guest.preferences.specialRequests.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-zinc-500 mb-2">Special Requests</p>
                      <div className="flex flex-wrap gap-2">
                        {guest.preferences.specialRequests.map((req, index) => (
                          <span key={index} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {guest.notes && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Notes</h3>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-zinc-300">{guest.notes}</p>
              </div>
            </div>
          )}

          {/* Reservation History */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Reservation History ({guestReservations.length})
            </h3>
            {guestReservations.length === 0 ? (
              <div className="bg-zinc-900/30 rounded-lg p-8 text-center border border-zinc-800">
                <p className="text-sm text-zinc-500">No reservations found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {guestReservations.slice(0, 5).map(reservation => {
                  const property = properties.find(p => p.id === reservation.propertyId);
                  const checkIn = new Date(reservation.checkIn);
                  const checkOut = new Date(reservation.checkOut);
                  const sourceColor = sourceColors[reservation.source as keyof typeof sourceColors];

                  return (
                    <div
                      key={reservation.id}
                      className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: sourceColor }}
                            />
                            <h4 className="text-sm font-semibold text-white">
                              {property?.name || 'Unknown Property'}
                            </h4>
                            <span className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium capitalize',
                              reservation.status === 'upcoming' && 'bg-blue-500/20 text-blue-400',
                              reservation.status === 'checked_in' && 'bg-purple-500/20 text-purple-400',
                              reservation.status === 'checked_out' && 'bg-zinc-500/20 text-zinc-400',
                              reservation.status === 'cancelled' && 'bg-red-500/20 text-red-400'
                            )}>
                              {reservation.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-zinc-400">
                            <span>
                              {checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' - '}
                              {checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span>{reservation.totalNights} nights</span>
                            <span>{reservation.guests} guests</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-400">
                            ${reservation.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-zinc-500">
                            ${reservation.nightlyRate}/night
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {guestReservations.length > 5 && (
                  <p className="text-xs text-zinc-500 text-center pt-2">
                    +{guestReservations.length - 5} more reservations
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Communication Summary */}
          {guestThreads.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Communication History
              </h3>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                    <span className="text-sm text-white font-medium">
                      {guestThreads.length} conversation{guestThreads.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {guestThreads.reduce((sum, t) => sum + t.messages.length, 0)} total messages
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
