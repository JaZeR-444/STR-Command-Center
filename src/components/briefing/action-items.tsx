'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ActionItem {
  type: 'urgent' | 'important' | 'reminder';
  title: string;
  description: string;
  link?: string;
}

const typeConfig = {
  urgent: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  important: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-400',
    iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  reminder: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-400',
    iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
};

export function ActionItems({ items }: { items: ActionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="glass rounded-xl border-2 border-zinc-800 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">All Clear!</h3>
        <p className="text-zinc-400 text-sm">No urgent action items for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const config = typeConfig[item.type];
        const content = (
          <div className={cn(
            'rounded-xl border-2 p-4 transition-all',
            config.bg,
            config.border,
            item.link && 'hover:border-opacity-60 cursor-pointer'
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                config.bg
              )}>
                <svg className={cn('w-5 h-5', config.icon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.iconPath}/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium uppercase',
                    config.badge
                  )}>
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{item.description}</p>
              </div>
              {item.link && (
                <svg className="w-5 h-5 text-zinc-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              )}
            </div>
          </div>
        );

        if (item.link) {
          return (
            <Link key={index} href={item.link}>
              {content}
            </Link>
          );
        }

        return <div key={index}>{content}</div>;
      })}
    </div>
  );
}
