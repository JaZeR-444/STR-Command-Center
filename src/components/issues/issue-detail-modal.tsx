'use client';

import { useState } from 'react';
import { properties } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MaintenanceIssue, IssueStatus } from '@/types';

const statusColors = {
  reported: 'bg-zinc-700/30 text-zinc-400 border-zinc-700',
  assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  closed: 'bg-zinc-600/20 text-zinc-500 border-zinc-600',
};

export function IssueDetailModal({
  issue,
  onClose,
  onUpdateStatus,
}: {
  issue: MaintenanceIssue;
  onClose: () => void;
  onUpdateStatus?: (issueId: string, status: IssueStatus) => void;
}) {
  const property = properties.find(p => p.id === issue.propertyId);
  const reportedDate = new Date(issue.reportedAt);

  const handleStatusChange = (newStatus: IssueStatus) => {
    onUpdateStatus?.(issue.id, newStatus);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl border-2 border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 glass px-6 py-4 border-b border-zinc-800 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                'px-2 py-0.5 rounded text-xs font-medium capitalize border',
                issue.priority === 'urgent' && 'bg-red-500/10 text-red-400 border-red-500/20',
                issue.priority === 'high' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                issue.priority === 'medium' && 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                issue.priority === 'low' && 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
              )}>
                {issue.priority} Priority
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded text-xs font-medium capitalize border',
                statusColors[issue.status]
              )}>
                {issue.status.replace('_', ' ')}
              </span>
              {issue.category && (
                <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-zinc-800 text-zinc-400">
                  {issue.category}
                </span>
              )}
            </div>
            <h2 className="text-xl font-display font-bold text-white">{issue.title}</h2>
            {property && (
              <p className="text-sm text-zinc-500 mt-1">{property.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-zinc-300">{issue.description}</p>
          </div>

          {/* Reporter Info */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Reported By</h3>
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Name</p>
                  <p className="text-sm font-semibold text-white">{issue.reportedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Source</p>
                  <p className="text-sm font-semibold text-white capitalize">{issue.source}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Reported At</p>
                  <p className="text-sm font-semibold text-white">
                    {reportedDate.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment */}
          {issue.assignedTo && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Assignment</h3>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Assigned To</p>
                    <p className="text-sm font-semibold text-white">{issue.assignedTo}</p>
                  </div>
                  {issue.assignedAt && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Assigned At</p>
                      <p className="text-sm font-semibold text-white">
                        {new Date(issue.assignedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cost */}
          {(issue.estimatedCost || issue.actualCost) && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Cost</h3>
              <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
                <div className="grid grid-cols-2 gap-4">
                  {issue.estimatedCost && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Estimated Cost</p>
                      <p className="text-2xl font-bold text-blue-400">${issue.estimatedCost}</p>
                    </div>
                  )}
                  {issue.actualCost && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Actual Cost</p>
                      <p className="text-2xl font-bold text-emerald-400">${issue.actualCost}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resolution */}
          {issue.resolution && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Resolution</h3>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                <p className="text-sm text-zinc-300">{issue.resolution}</p>
                {issue.resolvedAt && (
                  <p className="text-xs text-emerald-400 mt-2">
                    Resolved on {new Date(issue.resolvedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {issue.notes && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Notes</h3>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <p className="text-sm text-zinc-300">{issue.notes}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {issue.tags && issue.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {issue.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Photos placeholder */}
          {issue.photos && issue.photos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Photos</h3>
              <div className="grid grid-cols-3 gap-2">
                {issue.photos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Actions */}
          {issue.status !== 'closed' && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="flex gap-2 flex-wrap">
                {issue.status === 'reported' && (
                  <Button
                    onClick={() => handleStatusChange('assigned')}
                    variant="primary"
                    className="flex-1"
                  >
                    Assign Issue
                  </Button>
                )}
                {issue.status === 'assigned' && (
                  <Button
                    onClick={() => handleStatusChange('in_progress')}
                    variant="primary"
                    className="flex-1"
                  >
                    Start Work
                  </Button>
                )}
                {issue.status === 'in_progress' && (
                  <Button
                    onClick={() => handleStatusChange('resolved')}
                    variant="primary"
                    className="flex-1"
                  >
                    Mark Resolved
                  </Button>
                )}
                {issue.status === 'resolved' && (
                  <Button
                    onClick={() => handleStatusChange('closed')}
                    variant="primary"
                    className="flex-1"
                  >
                    Close Issue
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Closed info */}
          {issue.status === 'closed' && issue.closedAt && (
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="text-sm">
                  Issue closed on {new Date(issue.closedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
