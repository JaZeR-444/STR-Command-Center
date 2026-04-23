'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { GuestCard } from '@/components/guests/guest-card';
import { GuestProfileModal } from '@/components/guests/guest-profile-modal';
import { cn } from '@/lib/utils';
import type { GuestProfile, GuestFlag } from '@/types';

export default function GuestsPage() {
  const { state } = useApp();
  const guests = Object.values(state.guests);
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFlag, setFilterFlag] = useState<'all' | GuestFlag>('all');
  const [sortBy, setSortBy] = useState<'name' | 'trips' | 'spent' | 'recent'>('recent');

  // Filter and sort guests
  const filteredGuests = useMemo(() => {
    let filtered = guests;

    // Filter by flag
    if (filterFlag !== 'all') {
      filtered = filtered.filter(g => g.flags?.includes(filterFlag));
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(term) ||
        g.email?.toLowerCase().includes(term) ||
        g.phone?.includes(term)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortBy === 'trips') {
        return b.totalTrips - a.totalTrips;
      } else if (sortBy === 'spent') {
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      } else {
        // Recent - last stay date
        const aDate = a.lastStayDate ? new Date(a.lastStayDate).getTime() : 0;
        const bDate = b.lastStayDate ? new Date(b.lastStayDate).getTime() : 0;
        return bDate - aDate;
      }
    });

    return sorted;
  }, [guests, filterFlag, searchTerm, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const vipCount = guests.filter(g => g.flags?.includes('vip')).length;
    const repeatCount = guests.filter(g => g.flags?.includes('repeat')).length;
    const totalSpent = guests.reduce((sum, g) => sum + (g.totalSpent || 0), 0);
    const avgSpent = guests.length > 0 ? totalSpent / guests.length : 0;

    return {
      total: guests.length,
      vipCount,
      repeatCount,
      totalSpent,
      avgSpent,
    };
  }, [guests]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          Guest Profiles
        </h1>
        <p className="text-zinc-400 text-sm mt-2">Manage guest relationships and history</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Total Guests</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">VIP Guests</p>
              <p className="text-2xl font-bold text-amber-400">{stats.vipCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Repeat Guests</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.repeatCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Avg Lifetime Value</p>
              <p className="text-2xl font-bold text-purple-400">${stats.avgSpent.toFixed(0)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Flag Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterFlag('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-medium transition-all',
                filterFlag === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterFlag('vip')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-medium transition-all',
                filterFlag === 'vip'
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              VIP
            </button>
            <button
              onClick={() => setFilterFlag('repeat')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-medium transition-all',
                filterFlag === 'repeat'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              Repeat
            </button>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="trips">Most Trips</option>
              <option value="spent">Most Spent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guest Grid */}
      {filteredGuests.length === 0 ? (
        <div className="glass rounded-2xl border-2 border-zinc-800 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">No Guests Found</h2>
          <p className="text-zinc-400">
            {searchTerm
              ? `No guests match "${searchTerm}"`
              : 'No guests to display'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredGuests.map(guest => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onClick={() => setSelectedGuest(guest)}
            />
          ))}
        </div>
      )}

      {/* Guest Profile Modal */}
      {selectedGuest && (
        <GuestProfileModal
          guest={selectedGuest}
          state={state}
          onClose={() => setSelectedGuest(null)}
        />
      )}
    </div>
  );
}
