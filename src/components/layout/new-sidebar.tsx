'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';

// Core navigation items (merged Main + Operations)
const coreNavItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  },
  {
    href: '/inbox',
    label: 'Inbox',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    badge: 4,
  },
  {
    href: '/reservations',
    label: 'Reservations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/operations',
    label: 'Operations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9.1 19a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.8 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.7a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
      </svg>
    ),
    badge: 3,
  },
  {
    href: '/pricing',
    label: 'Pricing & Market',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M5 9l7-7 7 7"/>
      </svg>
    ),
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18"/>
        <path d="M7 14l4-4 4 4 5-5"/>
      </svg>
    ),
  },
];

// Property Setup nav items (collapsible)
const setupNavItems = [
  {
    href: '/roadmap',
    label: 'Roadmap',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    ),
  },
  {
    href: '/focus',
    label: 'Focus',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
];

export function NewSidebar() {
  const pathname = usePathname();
  const { state } = useApp();
  const [isSetupCollapsed, setIsSetupCollapsed] = React.useState(true);

  return (
    <aside 
      className="fixed inset-y-0 left-0 z-40 flex flex-col overflow-y-auto"
      style={{ 
        width: 'var(--sidebar-width)',
        background: 'var(--sidebar)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-[18px] py-4 border-b border-white/[0.06] flex-shrink-0">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--blue)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white leading-tight">STR Command</div>
          <div 
            className="text-[10px] text-white/40 font-medium tracking-[0.12em] mt-0.5"
            style={{ fontFamily: 'var(--f-mono)' }}
          >
            AUSTIN · 4 UNITS
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-2 overflow-y-auto">
        {/* Core Operations Section */}
        <ul className="space-y-0.5 pt-2">
          {coreNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-all relative',
                    isActive
                      ? 'text-white'
                      : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
                  )}
                  style={isActive ? { background: 'var(--blue)' } : undefined}
                >
                  <span className={cn('flex-shrink-0', isActive ? 'opacity-100' : 'opacity-80')}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center',
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'text-white'
                      )}
                      style={!isActive ? { background: 'var(--red)' } : undefined}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <hr className="border-t border-white/[0.06] my-3 mx-2.5" />

        {/* Property Setup Section (Collapsible) */}
        <div>
          <button
            onClick={() => setIsSetupCollapsed(!isSetupCollapsed)}
            className="flex items-center gap-2 w-full px-2 py-2 text-left hover:bg-white/[0.04] rounded-lg transition-colors"
          >
            <svg
              className={cn(
                'w-3 h-3 text-white/40 transition-transform shrink-0',
                isSetupCollapsed ? '-rotate-90' : 'rotate-0'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/[0.28]">
              Property Setup
            </p>
          </button>

          {!isSetupCollapsed && (
            <ul className="space-y-0.5 mt-1">
              {setupNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-all relative',
                        isActive
                          ? 'text-white'
                          : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90'
                      )}
                      style={isActive ? { background: 'var(--blue)' } : undefined}
                    >
                      <span className={cn('flex-shrink-0', isActive ? 'opacity-100' : 'opacity-80')}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* Bottom User Section */}
      <div className="px-2.5 py-3 border-t border-white/[0.06] flex-shrink-0">
        <button
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg w-full transition-colors hover:bg-white/[0.06]"
          onClick={() => {
            // TODO: Open user menu
          }}
        >
          <div 
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--p1), #c07010)' }}
          >
            RH
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[13px] font-semibold text-white/85 truncate">Ryan H.</div>
            <div className="text-[10.5px] text-white/40 truncate">Portfolio Owner</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
