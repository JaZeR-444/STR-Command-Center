'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';
import { getOccupancyStatus } from '@/lib/selectors';

const navItems = [
  {
    href: '/briefing',
    label: 'Today',
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    )
  },
  {
    href: '/inbox',
    label: 'Inbox',
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    )
  },
  {
    href: '/reservations',
    label: 'Stays',
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    )
  },
  {
    href: '/operations',
    label: 'Tasks',
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  {
    href: '/',
    label: 'More',
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { state, isLoaded } = useApp();
  
  const occupancyStatus = isLoaded ? getOccupancyStatus(state) : 'vacant';

  return (
    <>
      {/* Mobile Top Header (Sticky) */}
      <header className="lg:hidden sticky top-0 z-40 glass-heavy border-b border-white/10 shadow-md">
        <div className="flex items-center justify-between px-5 py-3">
          <Link href="/" className="flex flex-col min-w-0 pointer-events-auto">
            <h1 className="text-lg font-display font-semibold text-white leading-tight">
              STR Operations
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[9px] text-zinc-500 uppercase tracking-[0.24em] font-semibold">
                Live Sync
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Rapid Context Block */}
            <div className="text-right flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-[0.24em] text-zinc-500 font-bold">Status</span>
              <span className={cn(
                "text-xs font-bold uppercase",
                occupancyStatus === 'occupied' ? 'text-emerald-400' :
                occupancyStatus === 'turnover' ? 'text-amber-400' : 'text-blue-400'
              )}>
                {occupancyStatus}
              </span>
            </div>

            {/* Global Search / Command trigger */}
            <button
              onClick={() => {
                const ev = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
                document.dispatchEvent(ev);
              }}
              className="w-8 h-8 flex flex-col items-center justify-center rounded-full premium-pill text-zinc-300 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Settings Link */}
            <Link 
              href="/settings"
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full border transition-all",
                pathname === '/settings' ? "premium-pill border-white/15 text-white" : "premium-pill text-zinc-300 hover:text-white"
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </Link>
          </div>
        </div>
        {/* Optional: subtle border bottom if not using ribbon */}
        <div className="w-full h-[1px] bg-white/5 absolute bottom-0 left-0" />
      </header>

      {/* Mobile Bottom Tab Bar (iOS style) */}
      <nav className="lg:hidden fixed bottom-0 left-0 z-50 w-full h-[76px] glass-heavy border-t border-white/10 flex items-center justify-around pb-safe safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isInbox = item.label === 'Inbox';
          const unreadCount = isInbox ? state.inboxThreads.filter(t => t.unread > 0).length : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative w-full h-full flex flex-col items-center justify-center gap-1 min-w-[64px]"
            >
              {isActive && (
                <div className="absolute top-0 w-1/2 h-[3px] bg-[#d9b36c] rounded-b-full shadow-[0_0_10px_rgba(217,179,108,0.5)]" />
              )}

              <div className={cn(
                "relative flex items-center justify-center transition-transform active:scale-90",
                isActive ? "text-[#f1d39a]" : "text-zinc-500"
              )}>
                {item.icon}

                {isInbox && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-zinc-950">
                    {unreadCount}
                  </span>
                )}
              </div>

              <span className={cn(
                "text-[10px] uppercase font-bold tracking-[0.2em]",
                isActive ? "text-zinc-100" : "text-zinc-500"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
