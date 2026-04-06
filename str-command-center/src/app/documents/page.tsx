'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { documentationData, documentsBySection, documentSections, documentTypes } from '@/data/documents';
import { isDocCompleted } from '@/lib/selectors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input, Select } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function DocumentsPage() {
  const { state, isLoaded, toggleDoc } = useApp();
  const [sectionFilter, setSectionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
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
  }, [isLoaded, sectionFilter, typeFilter, completionFilter, searchTerm, state.completedDocIds]);

  // Stats
  const stats = useMemo(() => {
    const total = documentationData.length;
    const completed = state.completedDocIds.length;
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [state.completedDocIds]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Documentation Index</h1>
        <p className="text-slate-400">
          {stats.completed} of {stats.total} artifacts ready ({stats.percentage}%)
        </p>
      </header>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredDocs.length} {filteredDocs.length === 1 ? 'artifact' : 'artifacts'}
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-border-dark">
          {filteredDocs.length === 0 ? (
            <CardContent className="py-8 text-center text-slate-500">
              No documents match your filters
            </CardContent>
          ) : (
            filteredDocs.map(doc => {
              const isCompleted = isDocCompleted(state, doc.id);

              return (
                <div
                  key={doc.id}
                  className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <Checkbox
                    checked={isCompleted}
                    onChange={() => toggleDoc(doc.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn(
                        'text-sm font-medium',
                        isCompleted ? 'text-slate-500 line-through' : 'text-white'
                      )}>
                        {doc.artifact}
                      </p>
                      {isCompleted && (
                        <span className="text-emerald-400 text-xs">✓ Ready</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {doc.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="timing" timing={doc.timing}>
                        {doc.timing}
                      </Badge>
                      <span className="text-[10px] text-slate-600">{doc.type}</span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className="text-[10px] text-slate-600">{doc.section}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
