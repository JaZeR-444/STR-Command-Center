'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export function RevenueChart({
  data,
  height = 200,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-zinc-500 pr-2">
          <div className="text-right">${(maxValue).toLocaleString()}</div>
          <div className="text-right">${(maxValue * 0.75).toLocaleString()}</div>
          <div className="text-right">${(maxValue * 0.5).toLocaleString()}</div>
          <div className="text-right">${(maxValue * 0.25).toLocaleString()}</div>
          <div className="text-right">$0</div>
        </div>

        {/* Grid lines */}
        <div className="absolute left-16 right-0 top-0 bottom-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="border-t border-zinc-800/50" />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute left-16 right-0 top-0 bottom-0 flex items-end gap-2 pb-0">
          {data.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group relative"
              >
                {/* Bar */}
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all cursor-pointer hover:opacity-80',
                    item.color || 'bg-gradient-to-t from-blue-500 to-blue-400'
                  )}
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 border-2 border-zinc-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div className="text-xs font-semibold text-white">${item.value.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{item.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-2 pl-16">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <div className="text-xs text-zinc-400 truncate">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
