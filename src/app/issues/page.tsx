'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { properties } from '@/data/properties';
import { IssueCard } from '@/components/issues/issue-card';
import { IssueDetailModal } from '@/components/issues/issue-detail-modal';
import { cn } from '@/lib/utils';
import type { MaintenanceIssue, IssuePriority, IssueStatus } from '@/types';

export default function IssuesPage() {
  const { state } = useApp();
  const { maintenanceIssues } = state;
  const [selectedIssue, setSelectedIssue] = useState<MaintenanceIssue | null>(null);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [filterPriority, setFilterPriority] = useState<'all' | IssuePriority>('all');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | IssueStatus>('active');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter issues
  const filteredIssues = useMemo(() => {
    let filtered = maintenanceIssues;

    // Filter by property
    if (selectedProperty !== 'all') {
      filtered = filtered.filter(i => i.propertyId === selectedProperty);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(i => i.priority === filterPriority);
    }

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(i => i.status !== 'closed' && i.status !== 'resolved');
    } else if (filterStatus !== 'all') {
      filtered = filtered.filter(i => i.status === filterStatus);
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(term) ||
        i.description.toLowerCase().includes(term) ||
        i.reportedBy?.toLowerCase().includes(term) ||
        i.assignedTo?.toLowerCase().includes(term)
      );
    }

    // Sort: urgent first, then by reported date
    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    });
  }, [maintenanceIssues, selectedProperty, filterPriority, filterStatus, searchTerm]);

  // Group by status
  const groupedIssues = useMemo(() => {
    return {
      reported: filteredIssues.filter(i => i.status === 'reported'),
      assigned: filteredIssues.filter(i => i.status === 'assigned'),
      in_progress: filteredIssues.filter(i => i.status === 'in_progress'),
      resolved: filteredIssues.filter(i => i.status === 'resolved'),
      closed: filteredIssues.filter(i => i.status === 'closed'),
    };
  }, [filteredIssues]);

  const handleUpdateStatus = (issueId: string, newStatus: IssueStatus) => {
    console.log('Update issue status:', issueId, newStatus);
    alert('Issue status update will be implemented with full context integration');
    // TODO: Implement via context method
  };

  const urgentCount = maintenanceIssues.filter(i => i.priority === 'urgent' && i.status !== 'closed').length;
  const activeCount = maintenanceIssues.filter(i => i.status !== 'closed' && i.status !== 'resolved').length;
  const resolvedToday = maintenanceIssues.filter(i => {
    if (!i.resolvedAt) return false;
    const resolvedDate = new Date(i.resolvedAt).toDateString();
    return resolvedDate === new Date().toDateString();
  }).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          Issues & Maintenance
        </h1>
        <p className="text-zinc-400 text-sm mt-2">Track and resolve property maintenance issues</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Urgent Issues</p>
              <p className="text-2xl font-bold text-red-400">{urgentCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Active Issues</p>
              <p className="text-2xl font-bold text-amber-400">{activeCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Resolved Today</p>
              <p className="text-2xl font-bold text-emerald-400">{resolvedToday}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Property Filter */}
          {properties.length > 1 && (
            <div>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Properties</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Priority Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterPriority('all')}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                filterPriority === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterPriority('urgent')}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                filterPriority === 'urgent'
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              Urgent
            </button>
            <button
              onClick={() => setFilterPriority('high')}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                filterPriority === 'high'
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              High
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('active')}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                filterStatus === 'active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Issue Queue */}
      {filterStatus === 'active' || filterStatus === 'all' ? (
        <div className="space-y-6">
          {/* Reported */}
          {groupedIssues.reported.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-zinc-500 rounded-full"></span>
                Reported ({groupedIssues.reported.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedIssues.reported.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onClick={() => setSelectedIssue(issue)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Assigned */}
          {groupedIssues.assigned.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Assigned ({groupedIssues.assigned.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedIssues.assigned.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onClick={() => setSelectedIssue(issue)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {groupedIssues.in_progress.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                In Progress ({groupedIssues.in_progress.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedIssues.in_progress.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onClick={() => setSelectedIssue(issue)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resolved */}
          {filterStatus === 'all' && groupedIssues.resolved.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Resolved ({groupedIssues.resolved.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedIssues.resolved.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onClick={() => setSelectedIssue(issue)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredIssues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => setSelectedIssue(issue)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredIssues.length === 0 && (
        <div className="glass rounded-2xl border-2 border-zinc-800 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">No Issues Found</h2>
          <p className="text-zinc-400">
            {searchTerm
              ? `No issues match "${searchTerm}"`
              : 'All issues resolved! Great work.'}
          </p>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
