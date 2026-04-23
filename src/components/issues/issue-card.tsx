'use client';

import { properties } from '@/data/properties';
import { cn } from '@/lib/utils';
import type { MaintenanceIssue } from '@/types';

const priorityColors = {
  urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  low: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const statusColors = {
  reported: 'bg-zinc-700/30 text-zinc-400',
  assigned: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-purple-500/20 text-purple-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-zinc-600/20 text-zinc-500',
};

const categoryIcons = {
  plumbing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
    </svg>
  ),
  electrical: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  ),
  hvac: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
    </svg>
  ),
  appliance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
    </svg>
  ),
  structural: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  ),
  cosmetic: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
    </svg>
  ),
  other: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  ),
};

export function IssueCard({
  issue,
  onClick,
}: {
  issue: MaintenanceIssue;
  onClick: () => void;
}) {
  const property = properties.find(p => p.id === issue.propertyId);
  const reportedDate = new Date(issue.reportedAt);
  const daysSinceReported = Math.floor((Date.now() - reportedDate.getTime()) / (1000 * 60 * 60 * 24));

  const icon = issue.category ? categoryIcons[issue.category] : categoryIcons.other;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl border-2 transition-all hover:border-zinc-600 hover:bg-zinc-900/50',
        issue.status === 'reported' && 'bg-zinc-900/30 border-zinc-800',
        issue.status === 'assigned' && 'bg-blue-500/5 border-blue-500/30',
        issue.status === 'in_progress' && 'bg-purple-500/5 border-purple-500/30',
        issue.status === 'resolved' && 'bg-emerald-500/5 border-emerald-500/30',
        issue.status === 'closed' && 'bg-zinc-900/20 border-zinc-800/50 opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-2 rounded-lg',
            issue.priority === 'urgent' && 'bg-red-500/10 text-red-400',
            issue.priority === 'high' && 'bg-amber-500/10 text-amber-400',
            issue.priority === 'medium' && 'bg-blue-500/10 text-blue-400',
            issue.priority === 'low' && 'bg-zinc-500/10 text-zinc-500'
          )}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{issue.title}</h3>
            {property && (
              <p className="text-xs text-zinc-500 mt-0.5">{property.name}</p>
            )}
          </div>
        </div>
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-medium border shrink-0',
          priorityColors[issue.priority]
        )}>
          {issue.priority}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{issue.description}</p>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
        {/* Status */}
        <span className={cn(
          'px-2 py-0.5 rounded font-medium',
          statusColors[issue.status]
        )}>
          {issue.status.replace('_', ' ')}
        </span>

        {/* Reported by */}
        <div className="flex items-center gap-1.5 text-zinc-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          {issue.reportedBy}
        </div>

        {/* Days ago */}
        <div className="flex items-center gap-1.5 text-zinc-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          {daysSinceReported === 0 ? 'Today' : `${daysSinceReported}d ago`}
        </div>

        {/* Cost */}
        {(issue.actualCost || issue.estimatedCost) && (
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            ${issue.actualCost || issue.estimatedCost}
            {!issue.actualCost && ' est.'}
          </div>
        )}
      </div>

      {/* Assigned to */}
      {issue.assignedTo && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Assigned to {issue.assignedTo}
        </div>
      )}

      {/* Tags */}
      {issue.tags && issue.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {issue.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-zinc-800/50 text-zinc-500 text-[10px] rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
