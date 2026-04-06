'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { documentationData, documentsBySection, documentSections, documentTypes } from '@/data/documents';
import { isDocCompleted } from '@/lib/selectors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress';
import { CardSkeleton } from '@/components/ui/skeleton';
import { cn, getProgressColor } from '@/lib/utils';

export default function DocumentsPage() {
  const { state, isLoaded, toggleDoc } = useApp();
  const [sectionFilter, setSectionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'required' | 'optional'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = useMemo(() => {
    if (!isLoaded) return [];
    
    let docs = [...documentationData];

    // Section filter
    if (sectionFilter !== 'all') {
      docs = docs.filter(d => d.section === sectionFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      docs = docs.filter(d => d.type === typeFilter);
    }

    // Priority filter (Pre-Listing = required for launch)
    if (priorityFilter === 'required') {
      docs = docs.filter(d => d.timing === 'Pre-Listing');
    } else if (priorityFilter === 'optional') {
      docs = docs.filter(d => d.timing !== 'Pre-Listing');
    }

    // Completion filter
    if (completionFilter === 'complete') {
      docs = docs.filter(d => state.completedDocIds.includes(d.id));
    } else if (completionFilter === 'incomplete') {
      docs = docs.filter(d => !state.completedDocIds.includes(d.id));
    }

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      docs = docs.filter(d =>
        d.artifact.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term) ||
        d.section.toLowerCase().includes(term)
      );
    }

    return docs;
  }, [isLoaded, sectionFilter, typeFilter, completionFilter, priorityFilter, searchTerm, state.completedDocIds]);

  // Stats
  const stats = useMemo(() => {
    const total = documentationData.length;
    const completed = state.completedDocIds.length;
    const required = documentationData.filter(d => d.timing === 'Pre-Listing');
    const requiredCompleted = required.filter(d => state.completedDocIds.includes(d.id));
    
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      requiredTotal: required.length,
      requiredCompleted: requiredCompleted.length,
      requiredMissing: required.length - requiredCompleted.length,
      requiredPercentage: required.length > 0 ? Math.round((requiredCompleted.length / required.length) * 100) : 0,
    };
  }, [state.completedDocIds]);

  // Group by type for display
  const docsByType = useMemo(() => {
    return filteredDocs.reduce((acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    }, {} as Record<string, typeof filteredDocs>);
  }, [filteredDocs]);

  if (!isLoaded) {
    return (
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-3xl">📄</span>
          Documentation Repository
        </h1>
        <p className="text-zinc-400 text-lg">
          Track and manage all artifacts required for launch
        </p>
      </header>

      {/* Required Documents Alert */}
      {stats.requiredMissing > 0 && (
        <Card className="mb-6 bg-amber-500/10 border-amber-500/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-400 mb-1">
                  {stats.requiredMissing} Required Document{stats.requiredMissing !== 1 ? 's' : ''} Missing
                </p>
                <p className="text-xs text-zinc-400">
                  Complete all Pre-Listing documents before launch
                </p>
              </div>
              <button
                onClick={() => setPriorityFilter('required')}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-all"
              >
                View Missing
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="py-6 text-center">
            <div className={cn('text-5xl font-bold mb-2', getProgressColor(stats.percentage))}>
              {stats.percentage}%
            </div>
            <p className="text-sm text-zinc-400 uppercase tracking-wider font-semibold mb-1">
              Overall Complete
            </p>
            <p className="text-xs text-zinc-600">
              {stats.completed} / {stats.total} artifacts
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          'transition-all',
          stats.requiredPercentage < 100 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
        )}>
          <CardContent className="py-6 text-center">
            <div className={cn(
              'text-5xl font-bold mb-2',
              stats.requiredPercentage === 100 ? 'text-emerald-400' : 'text-amber-400'
            )}>
              {stats.requiredPercentage}%
            </div>
            <p className="text-sm text-zinc-400 uppercase tracking-wider font-semibold mb-1">
              Required Ready
            </p>
            <p className="text-xs text-zinc-600">
              {stats.requiredCompleted} / {stats.requiredTotal} Pre-Listing
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-6 text-center">
            <div className="text-5xl font-bold mb-2 text-zinc-400">
              {stats.total - stats.requiredTotal}
            </div>
            <p className="text-sm text-zinc-400 uppercase tracking-wider font-semibold mb-1">
              Optional Docs
            </p>
            <p className="text-xs text-zinc-600">
              Ongoing & Post-Listing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search artifacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Sections' },
                ...documentSections.map(s => ({ value: s, label: s })),
              ]}
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                ...documentTypes.map(t => ({ value: t, label: t })),
              ]}
            />
            <Select
              value={completionFilter}
              onChange={(e) => setCompletionFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'complete', label: 'Complete' },
                { value: 'incomplete', label: 'Incomplete' },
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              options={[
                { value: 'all', label: 'All Priority' },
                { value: 'required', label: 'Required Only' },
                { value: 'optional', label: 'Optional Only' },
              ]}
            />
          </div>
          
          {/* Filter Chips */}
          <div className="flex gap-2 flex-wrap">
            {(['required', 'optional'] as const).map(priority => (
              <Button
                key={priority}
                variant={priorityFilter === priority ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPriorityFilter(priority === priorityFilter ? 'all' : priority)}
              >
                {priority === 'required' ? '⚠️ Required' : '📌 Optional'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-6">
        {Object.keys(docsByType).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-zinc-500">
              <p className="text-lg mb-2">No documents match your filters</p>
              <p className="text-sm">Try adjusting your filters above</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(docsByType).map(([type, docs]) => (
            <div key={type}>
              {/* Type Header */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full" />
                  {type}
                  <span className="text-sm text-zinc-500 font-normal">
                    ({docs.filter(d => state.completedDocIds.includes(d.id)).length}/{docs.length})
                  </span>
                </h3>
              </div>

              {/* Documents */}
              <Card>
                <div className="divide-y divide-zinc-800">
                  {docs.map(doc => {
                    const isCompleted = isDocCompleted(state, doc.id);
                    const isRequired = doc.timing === 'Pre-Listing';

                    return (
                      <div
                        key={doc.id}
                        className={cn(
                          'flex items-start gap-4 p-4 hover:bg-zinc-900/50 transition-colors group',
                          isRequired && !isCompleted && 'bg-amber-500/5 border-l-4 border-amber-500'
                        )}
                      >
                        <Checkbox
                          checked={isCompleted}
                          onChange={() => toggleDoc(doc.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className={cn(
                              'text-sm font-semibold',
                              isCompleted ? 'text-zinc-500 line-through' : 'text-white'
                            )}>
                              {doc.artifact}
                            </p>
                            {isRequired && !isCompleted && (
                              <Badge variant="status" status="blocked">
                                Required
                              </Badge>
                            )}
                            {isCompleted && (
                              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Ready
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                            {doc.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="timing" timing={doc.timing}>
                              {doc.timing}
                            </Badge>
                            <span className="text-[10px] text-zinc-600">{doc.section}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-12 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Currently showing</p>
            <p className="text-lg font-semibold text-white">{filteredDocs.length} artifacts</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Object.keys(docsByType).length}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Types</div>
            </div>
            <div className="text-center">
              <div className={cn(
                'text-2xl font-bold',
                stats.requiredMissing === 0 ? 'text-emerald-400' : 'text-amber-400'
              )}>
                {stats.requiredMissing}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Missing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
