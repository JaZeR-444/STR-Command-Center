'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';
import {
  getSectionSummaries,
  getBlockedTasks,
  getInProgressTasks,
  getOverallStats,
  getDaysUntilLaunch
} from '@/lib/selectors';
import { documentationData } from '@/data/documents';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useEffect, useState } from 'react';

// Main Nav
const topNavItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: '/roadmap',
    label: 'Roadmap',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    ),
  },
  {
    href: '/focus',
    label: 'Focus',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { state, isLoaded } = useApp();
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar-collapsed', false);

  // Operational Stats
  const blockedTasks = isLoaded ? getBlockedTasks(state) : [];
  const inProgressTasks = isLoaded ? getInProgressTasks(state) : [];
  const overallStats = isLoaded ? getOverallStats(state) : { percentage: 0 };
  const missingRequiredDocs = isLoaded 
    ? documentationData.filter(d => d.timing === 'Pre-Listing' && !state.completedDocIds.includes(d.id)).length 
    : 0;
  
  // Fake Hydration mismatch wrapper for dates
  const [daysToLaunch, setDaysToLaunch] = useState<number>(0);
  useEffect(() => {
    if (isLoaded) setDaysToLaunch(getDaysUntilLaunch(state.launchDate));
  }, [isLoaded, state.launchDate]);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 ease-in-out shrink-0 select-none overflow-hidden relative z-50 shadow-2xl',
        isCollapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* ── Header: Property Context ── */}
      <div
        className={cn(
          'flex items-center min-h-[64px]',
          isCollapsed ? 'justify-center px-0' : 'px-5 gap-3'
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner hover:bg-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0',
            isCollapsed ? 'w-10 h-10' : 'w-8 h-8'
          )}
          title={isCollapsed ? 'Expand Control Strip' : 'Collapse Control Strip'}
          aria-label="Toggle Sidebar"
        >
          <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        {!isCollapsed && (
            <Link href="/" className="flex flex-col min-w-0 outline-none flex-1 group">
              <h1 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wide leading-tight group-hover:text-blue-400 transition-colors">
                STR Launch
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5 truncate">
                Austin Operations
              </p>
            </Link>
        )}
      </div>

      {/* ── Context Board (Health Signals) ── */}
      {!isCollapsed && (
        <div className="px-5 mb-4">
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3 flex flex-col gap-3 shadow-inner">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Countdown</p>
                <p className="text-lg font-bold text-zinc-200 leading-none">
                  {daysToLaunch} <span className="text-xs text-zinc-500 font-medium">days</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Readiness</p>
                <p className={cn("text-lg font-bold leading-none", overallStats.percentage === 100 ? 'text-emerald-400' : 'text-amber-400')}>
                  {overallStats.percentage}%
                </p>
              </div>
            </div>
            
            <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-500", overallStats.percentage === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-amber-400')}
                style={{ width: `${overallStats.percentage}%` }}
              />
            </div>

            {blockedTasks.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-red-400 font-bold tracking-wide uppercase">
                  {blockedTasks.length} Blocked Items
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Primary Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 sidebar-scrollbar">
        {!isCollapsed && (
          <p className="px-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 mt-2">
            Workflows
          </p>
        )}
        <ul className="flex flex-col gap-1">
          {topNavItems.map((item) => {
            const isActive = pathname === item.href;
            
            // Determine Badges
            let badgeCount = 0;
            let badgeVariant = 'default';

            if (item.label === 'Focus' && blockedTasks.length > 0) {
              badgeCount = blockedTasks.length;
              badgeVariant = 'error';
            } else if (item.label === 'Roadmap' && inProgressTasks.length > 0) {
              badgeCount = inProgressTasks.length;
              badgeVariant = 'warning';
            } else if (item.label === 'Documents' && missingRequiredDocs > 0) {
              badgeCount = missingRequiredDocs;
              badgeVariant = 'warning';
            }

            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'relative flex items-center rounded-xl text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 group',
                    isCollapsed ? 'justify-center h-12 w-12 mx-auto my-0.5' : 'px-3 py-2.5 gap-3',
                    isActive
                      ? 'bg-blue-500/10 text-blue-400 font-bold'
                      : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
                  )}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  )}

                  {/* Icon */}
                  <span className={cn('flex items-center justify-center shrink-0 transition-transform duration-200', isActive && !isCollapsed && 'scale-110')}>
                    {item.icon}
                  </span>

                  {/* Label */}
                  {!isCollapsed && (
                    <span className="flex-1 truncate tracking-wide">{item.label}</span>
                  )}

                  {/* Badge */}
                  {badgeCount > 0 && (
                    <span 
                      className={cn(
                        'flex items-center justify-center font-bold',
                        isCollapsed 
                          ? 'absolute top-2 right-2 w-4 h-4 text-[9px] rounded-full ring-2 ring-zinc-950' 
                          : 'px-2 py-0.5 text-[10px] rounded-full',
                        badgeVariant === 'error' ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'bg-amber-500/20 text-amber-500 border border-amber-500/20'
                      )}
                    >
                      {badgeCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Lower Utility Nav  ── */}
      <div className="px-3 pb-4 pt-2 mt-auto flex flex-col gap-1 border-t border-zinc-800/80 bg-zinc-950">
        
        {/* Search / Command Palette */}
        <button
          onClick={() => {
            const ev = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
            document.dispatchEvent(ev);
          }}
          className={cn(
            'flex items-center rounded-xl text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200 group relative',
            isCollapsed ? 'justify-center h-12 w-12 mx-auto' : 'px-3 py-2.5 gap-3 w-full'
          )}
          title={isCollapsed ? 'Search (Ctrl+K)' : undefined}
        >
          <span className="flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          {!isCollapsed && (
            <>
              <span className="flex-1 truncate text-left tracking-wide">Search</span>
              <span className="text-[10px] font-mono bg-zinc-800/60 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-700/50">⌘K</span>
            </>
          )}
        </button>

        {/* Settings */}
        <Link
          href="/settings"
          title={isCollapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center rounded-xl text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200 group relative',
            isCollapsed ? 'justify-center h-12 w-12 mx-auto' : 'px-3 py-2.5 gap-3',
            pathname === '/settings' && 'bg-blue-500/10 text-blue-400 font-bold'
          )}
        >
          {pathname === '/settings' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          )}
          <span className="flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </span>
          {!isCollapsed && <span className="flex-1 truncate tracking-wide">Settings</span>}
        </Link>
        
        {/* Autosave Indicator */}
        {!isCollapsed && (
          <div className="flex items-center justify-center gap-1.5 mt-2 opacity-50 hover:opacity-100 transition-opacity">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">System Synced</span>
          </div>
        )}
      </div>
    </aside>
  );
}
