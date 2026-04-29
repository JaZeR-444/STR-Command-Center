'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';

export function Topbar() {
  const { state, setTheme } = useApp();
  const [searchFocused, setSearchFocused] = useState(false);

  const currentTheme = state.preferences?.theme || 'light';

  return (
    <header 
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 flex-shrink-0"
      style={{
        height: 'var(--topbar-height)',
        background: 'var(--topbar)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Search */}
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all w-[280px]`}
        style={{
          background: searchFocused ? '#fff' : 'var(--bg)',
          border: `1px solid ${searchFocused ? 'var(--blue)' : 'var(--border)'}`,
          boxShadow: searchFocused ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
        }}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7"/>
          <path d="m21 21-3.35-3.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search guests, bookings, properties…"
          className="flex-1 bg-transparent border-none outline-none text-[13px]"
          style={{
            color: 'var(--ink)',
            fontFamily: 'var(--f-ui)',
          }}
        />
        <kbd 
          className="px-1.5 py-0.5 text-[10px] rounded border"
          style={{
            fontFamily: 'var(--f-mono)',
            color: 'var(--ink4)',
            borderColor: 'var(--border)',
            background: '#fff',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={() => {
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(nextTheme);
          }}
          className="w-[34px] h-[34px] flex items-center justify-center rounded-lg transition-all"
          style={{
            border: '1px solid var(--border)',
            background: '#fff',
            color: 'var(--ink3)',
          }}
          title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
        >
          {currentTheme === 'light' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative w-[34px] h-[34px] flex items-center justify-center rounded-lg transition-all hover:border-blue-500 hover:text-blue-600"
          style={{
            border: '1px solid var(--border)',
            background: '#fff',
            color: 'var(--ink3)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {/* Notification dot */}
          <span 
            className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full border-[1.5px] border-white"
            style={{ background: 'var(--red)' }}
          />
        </button>

        {/* Settings */}
        <button
          className="w-[34px] h-[34px] flex items-center justify-center rounded-lg transition-all hover:border-blue-500 hover:text-blue-600"
          style={{
            border: '1px solid var(--border)',
            background: '#fff',
            color: 'var(--ink3)',
          }}
          onClick={() => {
            // Navigate to settings
            window.location.href = '/settings';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9.1 19a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.8 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.7a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
