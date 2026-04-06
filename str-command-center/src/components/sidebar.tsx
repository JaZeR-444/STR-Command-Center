'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';
import { getOverallStats, getSectionSummaries } from '@/lib/selectors';
import { sections, getShortSectionName, getSectionNumber } from '@/data/roadmap';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { href: '/roadmap', label: 'Roadmap', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { href: '/documents', label: 'Documents', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/focus', label: 'Focus', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { state, isLoaded } = useApp();
  const sectionSummaries = isLoaded ? getSectionSummaries(state) : [];

  return (
    <aside className="hidden lg:flex w-72 h-screen bg-card-dark border-r border-border-dark flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-dark">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Launch Center
        </h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
          Austin STR Operations
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-white/5'
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Section Navigation */}
        <div className="mt-6 pt-4 border-t border-border-dark">
          <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">
            Sections
          </p>
          <div className="space-y-1">
            {sectionSummaries.map((section, idx) => (
              <Link
                key={section.name}
                href={`/roadmap?section=${encodeURIComponent(section.name)}`}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all group',
                  pathname.startsWith('/roadmap') && 
                    new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('section') === section.name
                    ? 'bg-white/5 text-white'
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                )}
              >
                <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 text-xs font-bold">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 truncate">{section.shortName}</span>
                <span className={cn(
                  'text-[10px] font-bold',
                  section.percentage === 100 ? 'text-emerald-400' :
                  section.percentage >= 50 ? 'text-amber-400' : 'text-slate-600'
                )}>
                  {section.percentage}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-dark">
        <div className="bg-card-hover rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-medium">Auto-Saved</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
