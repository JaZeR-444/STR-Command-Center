'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { properties } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ReservationDetailModal } from '@/components/reservations/reservation-detail-modal';
import { AddReservationModal } from '@/components/reservations/add-reservation-modal';
import { cn } from '@/lib/utils';
import type { Reservation, ReservationStatus } from '@/types';

const channelColors = {
  airbnb: 'bg-[#FF5A5F]',
  booking: 'bg-[#003580]',
  vrbo: 'bg-[#0071C2]',
  direct: 'bg-purple-600',
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

type TabType = 'all' | 'upcoming' | 'checked_in' | 'checked_out' | 'cancelled';

function ReservationCard({
  reservation,
  onClick,
}: {
  reservation: Reservation;
  onClick: () => void;
}) {
  const { state } = useApp();
  const guest = state.guests[reservation.guestId];
  const property = properties.find(p => p.id === reservation.propertyId);

  const checkInDate = new Date(reservation.checkIn);
  const checkOutDate = new Date(reservation.checkOut);

  return (
    <div
      onClick={onClick}
      className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn('w-6 h-6 rounded flex items-center justify-center text-xs', channelColors[reservation.source])}>
              {channelIcons[reservation.source]}
            </div>
            <h3 className="text-lg font-semibold text-white truncate">
              {guest ? `${guest.firstName} ${guest.lastName}` : 'Guest'}
            </h3>
          </div>
          <p className="text-sm text-zinc-500">{property?.name || 'Property'}</p>
        </div>
        <span className={cn('px-2 py-1 rounded text-xs font-bold border shrink-0 ml-2', statusColors[reservation.status])}>
          {reservation.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-zinc-950/50 rounded-lg p-3">
          <p className="text-xs text-zinc-600 mb-1">Check-in</p>
          <p className="text-sm font-semibold text-white">
            {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <p className="text-xs text-zinc-500">
            {checkInDate.toLocaleDateString('en-US', { weekday: 'short' })}
          </p>
        </div>
        <div className="bg-zinc-950/50 rounded-lg p-3">
          <p className="text-xs text-zinc-600 mb-1">Check-out</p>
          <p className="text-sm font-semibold text-white">
            {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <p className="text-xs text-zinc-500">
            {checkOutDate.toLocaleDateString('en-US', { weekday: 'short' })}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-zinc-500">{reservation.totalNights} night{reservation.totalNights !== 1 ? 's' : ''}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-500">{reservation.guests} guest{reservation.guests !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-lg font-bold text-emerald-400">${reservation.total.toLocaleString()}</span>
      </div>

      {reservation.specialRequests && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Special requests
          </p>
        </div>
      )}
    </div>
  );
}

export default function ReservationsPage() {
  const { state } = useApp();
  const { reservations } = state;
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter reservations
  const filteredReservations = useMemo(() => {
    let filtered = reservations;

    // Filter by tab/status
    if (activeTab !== 'all') {
      filtered = filtered.filter(r => r.status === activeTab);
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        const guest = state.guests[r.guestId];
        const guestName = guest ? `${guest.firstName} ${guest.lastName}`.toLowerCase() : '';
        const property = properties.find(p => p.id === r.propertyId);
        const propertyName = property?.name.toLowerCase() || '';
        return guestName.includes(term) || propertyName.includes(term) || r.confirmationCode?.toLowerCase().includes(term);
      });
    }

    // Sort by check-in date (upcoming first, then by date)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.checkIn).getTime();
      const dateB = new Date(b.checkIn).getTime();
      return dateA - dateB;
    });
  }, [reservations, activeTab, searchTerm, state.guests]);

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: reservations.length },
    { key: 'upcoming', label: 'Upcoming', count: reservations.filter(r => r.status === 'upcoming').length },
    { key: 'checked_in', label: 'Checked In', count: reservations.filter(r => r.status === 'checked_in').length },
    { key: 'checked_out', label: 'Completed', count: reservations.filter(r => r.status === 'checked_out').length },
    { key: 'cancelled', label: 'Cancelled', count: reservations.filter(r => r.status === 'cancelled').length },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1"/>
            </svg>
            Reservations
          </h1>
          <p className="text-zinc-400 text-sm mt-2">Booking management across all platforms</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Reservation
        </Button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0',
              activeTab === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-2 px-1.5 py-0.5 rounded text-xs font-bold',
              activeTab === tab.key ? 'bg-white/20' : 'bg-zinc-800'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by guest name, property, or confirmation code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Reservation List */}
      {filteredReservations.length === 0 ? (
        <div className="glass rounded-2xl border-2 border-zinc-800 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1"/>
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">No Reservations Found</h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-6">
            {searchTerm
              ? `No reservations match "${searchTerm}"`
              : `No ${activeTab === 'all' ? '' : activeTab.replace('_', ' ') + ' '}reservations yet`}
          </p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Reservation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredReservations.map(reservation => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onClick={() => setSelectedReservation(reservation)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddReservationModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
