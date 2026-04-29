'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';

// Operational navigation sections
const navSections = [
  {
    title: 'Core Ops',
    items: [
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
        href: '/inbox',
        label: 'Inbox',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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
      },
    ],
  },
  {
    title: 'Revenue & Market',
    items: [
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
    ],
  },
  {
    title: 'Property & Guests',
    items: [
      {
        href: '/properties',
        label: 'Properties',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        ),
      },
      {
        href: '/guests',
        label: 'Guests',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Settings & Admin',
    items: [
      {
        href: '/automation',
        label: 'Automation',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        ),
      },
      {
        href: '/settings',
        label: 'Settings',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ),
      },
    ],
  },
];

export function NewSidebar() {
  const pathname = usePathname();
  const { state } = useApp();

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
            AUSTIN · 1 PROPERTY
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-2 overflow-y-auto">
        {navSections.map((section, sectionIndex) => (
          <div key={section.title}>
            {/* Section Header */}
            <div className="px-2.5 pt-4 pb-2">
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.12em]">
                {section.title}
              </h3>
            </div>

            {/* Section Items */}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;

                // Calculate dynamic badges based on state
                let badgeCount: number | undefined = undefined;
                if (item.label === 'Inbox') {
                  badgeCount = state.inboxThreads?.filter(t => t.unread > 0).length || undefined;
                } else if (item.label === 'Operations') {
                  badgeCount = state.operationsTasks?.filter(t => t.status !== 'completed').length || undefined;
                }

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
                      {badgeCount && (
                        <span
                          className={cn(
                            'min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center',
                            isActive
                              ? 'bg-white/25 text-white'
                              : 'text-white'
                          )}
                          style={!isActive ? { background: 'var(--red)' } : undefined}
                        >
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Section Divider (except for last section) */}
            {sectionIndex < navSections.length - 1 && (
              <div className="my-2 border-t border-white/[0.06]" />
            )}
          </div>
        ))}
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
            <div className="text-[10.5px] text-white/40 truncate">Property Owner</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
