'use client';

import { cn, getProgressColor } from '@/lib/utils';

interface MobileSectionPickerProps {
  sections: string[];
  selectedSection: string;
  onSelect: (section: string) => void;
  sectionStats: Record<string, { pct: number; blocked: number; total: number; completed: number }>;
}

// Legacy component - roadmap data no longer available
export function MobileSectionPicker({
  sections,
  selectedSection,
  onSelect,
  sectionStats,
}: MobileSectionPickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value);
  };

  const stats = sectionStats[selectedSection] || { pct: 0, blocked: 0, total: 0, completed: 0 };

  return (
    <div className="md:hidden space-y-2">
      {/* Native select for better mobile UX */}
      <div className="relative">
        <select
          value={selectedSection}
          onChange={handleChange}
          className="w-full px-4 py-3 pr-10 bg-zinc-900 border-2 border-zinc-800 rounded-xl text-white font-medium appearance-none focus:outline-none focus:border-blue-500 transition-colors"
        >
          {sections.map((section, idx) => {
            const sStats = sectionStats[section] || { pct: 0, blocked: 0, total: 0, completed: 0 };
            return (
              <option key={section} value={section}>
                {String(idx + 1).padStart(2, '0')} • {section} ({sStats.completed}/{sStats.total})
              </option>
            );
          })}
        </select>
        
        {/* Chevron icon */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-zinc-500">Progress</span>
            <span className={cn('text-sm font-bold', getProgressColor(stats.pct))}>
              {stats.pct}%
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                stats.pct >= 100 ? 'bg-emerald-500' : stats.pct >= 50 ? 'bg-amber-500' : 'bg-blue-500'
              )}
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
        
        {stats.blocked > 0 && (
          <div className="flex flex-col items-center px-3 py-1 bg-red-500/15 border border-red-500/30 rounded-lg">
            <span className="text-xs text-red-400 font-bold">{stats.blocked}</span>
            <span className="text-[9px] text-red-500 uppercase tracking-wider">Blocked</span>
          </div>
        )}
      </div>
    </div>
  );
}
