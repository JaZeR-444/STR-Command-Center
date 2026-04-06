'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';
import { getOverallStats, getSectionSummaries, getBlockedTasks } from '@/lib/selectors';
import { sections, getShortSectionName, getSectionNumber } from '@/data/roadmap';
import { useLocalStorage } from '@/hooks/use-local-storage';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', shortIcon: '⊞' },
  { href: '/roadmap', label: 'Roadmap', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', shortIcon: '✓' },
  { href: '/documents', label: 'Documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', shortIcon: '📄' },
  { href: '/focus', label: 'Focus', icon: 'M13 10V3L4 14h7v7l9-11h-7z', shortIcon: '⚡' },
  { href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', shortIcon: '⚙' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { state, isLoaded } = useApp();
  const sectionSummaries = isLoaded ? getSectionSummaries(state) : [];
  const blockedTasks = isLoaded ? getBlockedTasks(state) : [];
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar-collapsed', false);

  return (
    <aside className={cn(
      'hidden lg:flex h-screen bg-zinc-950 border-r border-zinc-800 flex-col transition-all duration-300',
      isCollapsed ? 'w-20' : 'w-72'
    )}>
      {/* Header */}
      <div className={cn(
        'p-6 border-b border-zinc-800 backdrop-blur-sm bg-zinc-900/50',
        isCollapsed && 'px-4'
      )}>
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Launch Center
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">
              Austin STR Operations
            </p>
          </>
        ) : (
          <div className="text-2xl text-center">🚀</div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const blockedCount = item.href === '/focus' ? blockedTasks.length : 0;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full shadow-lg shadow-blue-400/50" />
                )}
                {!isCollapsed ? (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className="truncate">{item.label}</span>
                    {blockedCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">
                        {blockedCount}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="relative">
                    <span className="text-xl">{item.shortIcon}</span>
                    {blockedCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {blockedCount}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Section Navigation - Hide when collapsed */}
        {!isCollapsed && (
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <p className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
              Sections
            </p>
            <div className="space-y-1 max-h-[40vh] overflow-y-auto">
              {sectionSummaries.map((section, idx) => (
                <Link
                  key={section.name}
                  href={`/roadmap?section=${encodeURIComponent(section.name)}`}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-xl text-xs transition-all group',
                    pathname.startsWith('/roadmap') && 
                      new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === section.name
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                  )}
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-bold flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 truncate">{section.shortName}</span>
                  <span className={cn(
                    'text-[10px] font-bold',
                    section.percentage === 100 ? 'text-emerald-400' :
                    section.percentage >= 50 ? 'text-amber-400' : 'text-zinc-600'
                  )}>
                    {section.percentage}%
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={cn('p-4 border-t border-zinc-800', isCollapsed && 'px-2')}>
        {!isCollapsed && (
          <div className="bg-zinc-900 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-medium">Auto-Saved</span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Collapse sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-all"
            title="Expand sidebar"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}
