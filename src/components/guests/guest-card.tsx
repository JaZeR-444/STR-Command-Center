'use client';

import { cn } from '@/lib/utils';
import type { GuestProfile } from '@/types';

const sourceColors = {
  airbnb: 'text-[#FF5A5F]',
  booking: 'text-[#003580]',
  vrbo: 'text-[#0071C2]',
  direct: 'text-purple-400',
};

const flagColors = {
  vip: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  repeat: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  problematic: 'bg-red-500/10 text-red-400 border-red-500/20',
  blacklist: 'bg-red-600/10 text-red-500 border-red-600/30',
};

export function GuestCard({
  guest,
  reservationCount,
  onClick,
}: {
  guest: GuestProfile;
  reservationCount?: number;
  onClick: () => void;
}) {
  const hasVIP = guest.flags?.includes('vip');
  const hasProblematic = guest.flags?.includes('problematic');

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl border-2 transition-all hover:border-zinc-600 hover:bg-zinc-900/50',
        hasVIP && 'bg-amber-500/5 border-amber-500/30',
        hasProblematic && 'bg-red-500/5 border-red-500/30',
        !hasVIP && !hasProblematic && 'bg-zinc-900/30 border-zinc-800'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold',
            hasVIP && 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
            hasProblematic && 'bg-gradient-to-br from-red-500 to-red-600 text-white',
            !hasVIP && !hasProblematic && 'bg-zinc-800 text-zinc-300'
          )}>
            {guest.firstName[0]}{guest.lastName[0]}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              {guest.firstName} {guest.lastName}
              {guest.verified && (
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              )}
            </h3>
            <p className={cn(
              'text-xs font-medium capitalize',
              sourceColors[guest.source]
            )}>
              {guest.source}
            </p>
          </div>
        </div>

        {/* Flags */}
        {guest.flags && guest.flags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {guest.flags.map((flag, index) => (
              <span
                key={index}
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium border uppercase',
                  flagColors[flag]
                )}
              >
                {flag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800">
          <p className="text-[10px] text-zinc-500 mb-0.5">Trips</p>
          <p className="text-lg font-bold text-white">{guest.totalTrips}</p>
        </div>
        {guest.totalSpent && (
          <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800">
            <p className="text-[10px] text-zinc-500 mb-0.5">Spent</p>
            <p className="text-lg font-bold text-emerald-400">${guest.totalSpent.toLocaleString()}</p>
          </div>
        )}
        {guest.rating && (
          <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-800">
            <p className="text-[10px] text-zinc-500 mb-0.5">Rating</p>
            <p className="text-lg font-bold text-amber-400">{guest.rating} ⭐</p>
          </div>
        )}
      </div>

      {/* Contact */}
      {(guest.email || guest.phone) && (
        <div className="space-y-1 mb-3">
          {guest.email && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span className="truncate">{guest.email}</span>
            </div>
          )}
          {guest.phone && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>{guest.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Last stay */}
      {guest.lastStayDate && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Last stayed {new Date(guest.lastStayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}

      {/* Notes preview */}
      {guest.notes && (
        <div className="mt-3 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2">
          <p className="text-xs text-zinc-400 line-clamp-2">{guest.notes}</p>
        </div>
      )}
    </button>
  );
}
