'use client';

import { Suspense, useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context';
import { documentationData, documentSections, getDocShortSectionName, documentTypes } from '@/data/documents';
import { isDocCompleted } from '@/lib/selectors';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DocumentViewerPane } from '@/components/documents/document-viewer-pane';
import { CardSkeleton } from '@/components/ui/skeleton';
import { cn, getProgressColor } from '@/lib/utils';
import { getFile } from '@/lib/file-storage';
import type { DocumentArtifact } from '@/types';

/* ─── Section Tab Strip ──────────────────────────────────────── */

function SectionTabStrip({
  sections,
  selectedSection,
  onSelect,
  sectionStats,
}: {
  sections: string[];
  selectedSection: string;
  onSelect: (s: string) => void;
  sectionStats: Record<string, { pct: number; missingRequired: number }>;
}) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && tabsRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedSection]);

  return (
    <div className="relative">
      <div
        ref={tabsRef}
        className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {sections.map((section) => {
          const isActive = section === selectedSection;
          const numMatch = section.match(/^\d+/);
          const num = numMatch ? numMatch[0] : '00';
          const name = getDocShortSectionName(section);
          const stats = sectionStats[section] ?? { pct: 0, missingRequired: 0 };

          return (
            <button
              key={section}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSelect(section)}
              className={cn(
                'flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl border shrink-0 transition-all duration-150 text-left min-w-[120px] max-w-[160px]',
                isActive
                  ? 'bg-blue-500/15 border-blue-500/40 text-white'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
              )}
            >
              <div className="flex items-center justify-between w-full gap-1">
                <span className={cn(
                  'text-[9px] font-bold uppercase tracking-widest',
                  isActive ? 'text-blue-400' : 'text-zinc-600'
                )}>
                  {num.padStart(2, '0')}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  {stats.missingRequired > 0 && (
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-400 text-[8px] font-bold flex items-center justify-center">
                      !
                    </span>
                  )}
                  <span className={cn(
                    'text-[10px] font-bold',
                    getProgressColor(stats.pct)
                  )}>
                    {stats.pct}%
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold leading-tight line-clamp-2 w-full">{name}</span>
              <div className="w-full h-0.5 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    stats.pct >= 100 ? 'bg-emerald-500' : stats.pct >= 50 ? 'bg-amber-500' : 'bg-blue-500'
                  )}
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute left-0 top-0 bottom-1 w-4 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-4 bg-gradient-to-l from-zinc-950 to-transparent" />
    </div>
  );
}

/* ─── Document Card (Grid/List) ─────────────────────────── */

function DocumentItem({
  doc,
  state,
  onDocClick,
  toggleDoc,
  viewMode
}: {
  doc: DocumentArtifact;
  state: ReturnType<typeof useApp>['state'];
  onDocClick: (doc: DocumentArtifact, e: React.MouseEvent) => void;
  toggleDoc: (id: string) => void;
  viewMode: 'list' | 'grid';
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  const meta = state.docMeta[doc.id] || {};
  const isCompleted = isDocCompleted(state, doc.id);
  const isRequired = doc.timing === 'Pre-Listing';
  const attachments = meta.attachments || [];
  const status = meta.status || (isCompleted ? 'verified' : 'missing');
  const hasAttachment = attachments.length > 0;
  
  const statusColors = {
    missing: 'bg-zinc-800 text-zinc-400',
    in_review: 'bg-amber-500/20 text-amber-500',
    verified: 'bg-emerald-500/20 text-emerald-500',
    expired: 'bg-red-500/20 text-red-500'
  };
  
  const statusIcon = { missing: '🟡', in_review: '🟠', verified: '🟢', expired: '🔴' }[status];

  // Try to load a thumbnail for the first image attachment
  useEffect(() => {
    let isCancelled = false;
    if (viewMode === 'grid' && attachments.length > 0) {
      const imgAtt = attachments.find(a => a.type.startsWith('image/'));
      if (imgAtt) {
         getFile(imgAtt.id).then(file => {
           if (file && !isCancelled) {
             setThumbUrl(URL.createObjectURL(file));
           }
         });
      }
    }
    return () => {
      isCancelled = true;
      if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, attachments]);

  if (viewMode === 'grid') {
    return (
      <div
        className={cn(
          'flex flex-col relative overflow-hidden rounded-xl border bg-zinc-900/40 hover:bg-zinc-900/80 transition-all cursor-pointer group h-[200px]',
          isRequired && status === 'missing' ? 'border-amber-500/50' : 'border-zinc-800/80'
        )}
        onClick={(e) => onDocClick(doc, e)}
      >
        {thumbUrl ? (
          <div className="absolute inset-0 z-0">
             <img src={thumbUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="Preview" />
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-zinc-900/30 flex items-center justify-center">
            <svg className="w-12 h-12 text-zinc-800 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
        )}
        
        <div className="relative z-10 flex-1 flex flex-col p-4">
          <div className="flex items-start justify-between gap-2 mb-auto">
             <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1", statusColors[status])}>
               <span className="text-[8px]">{statusIcon}</span> {status.replace('_', ' ')}
             </span>
             {isRequired && status === 'missing' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />}
          </div>
          
          <div className="mt-auto">
            <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight mb-1">{doc.artifact}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {hasAttachment && (
                <span className="text-[10px] text-zinc-400 flex items-center gap-1 bg-zinc-950/50 px-1 rounded backdrop-blur-sm border border-zinc-800/50">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  {attachments.length}
                </span>
              )}
              {meta?.smartTags && meta.smartTags.length > 0 && (
                 <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-1 rounded border border-indigo-500/20 backdrop-blur-sm">
                   +{meta.smartTags.length} tags
                 </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 hover:bg-zinc-900/40 transition-colors cursor-pointer group',
        isRequired && status === 'missing' && 'bg-amber-500/5 border-l-2 border-l-amber-500'
      )}
      onClick={(e) => onDocClick(doc, e)}
    >
      <div className="mt-0.5 shrink-0" onClick={e => { e.stopPropagation(); toggleDoc(doc.id); }}>
        <Checkbox checked={status === 'verified'} onChange={() => toggleDoc(doc.id)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className={cn(
             'text-sm font-bold leading-snug',
             status === 'verified' ? 'text-zinc-500 line-through' : 'text-zinc-200'
          )}>
             {doc.artifact}
          </p>
          {isRequired && status === 'missing' && (
             <Badge variant="status" status="blocked">Required</Badge>
          )}
          {status !== 'missing' && (
             <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1", statusColors[status])}>
               <span className="text-[8px]">{statusIcon}</span> {status.replace('_', ' ')}
             </span>
          )}
        </div>
        
        <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
          {doc.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="timing" timing={doc.timing}>{doc.timing}</Badge>
          
          {hasAttachment && (
            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded flex items-center gap-1.5 font-semibold">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Linked
            </span>
          )}
          
          {meta?.note && (
            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Notes
            </span>
          )}
        </div>
      </div>
      <svg
        className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0 mt-0.5 opacity-0 group-hover:opacity-100"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

/* ─── Type Group ─────────────────────────────────────────── */

function TypeGroup({
  type,
  docs,
  state,
  isCollapsed,
  onToggleCollapse,
  onDocClick,
  toggleDoc,
  viewMode
}: {
  type: string;
  docs: DocumentArtifact[];
  state: ReturnType<typeof useApp>['state'];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onDocClick: (doc: DocumentArtifact, e: React.MouseEvent) => void;
  toggleDoc: (id: string) => void;
  viewMode: 'list' | 'grid';
}) {
  const completedCount = docs.filter(d => state.completedDocIds.includes(d.id)).length;
  const isAllDone = completedCount === docs.length;
  // Type icon mapping
  const getIcon = (type: string) => {
    if (type.includes('Strategy')) return '♟️';
    if (type.includes('Tracker') || type.includes('Spreadsheet')) return '📊';
    if (type.includes('Checklist') || type.includes('List')) return '✅';
    if (type.includes('Guide')) return '📖';
    if (type.includes('Asset')) return '🖼️';
    return '📄';
  };

  return (
    <div>
      <div
        className="sticky top-[52px] z-10 bg-zinc-950/97 backdrop-blur-sm py-2.5 mb-2 border-b border-zinc-800/70 cursor-pointer select-none"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <svg
              className={cn(
                'w-3.5 h-3.5 text-zinc-600 shrink-0 transition-transform duration-200',
                isCollapsed ? '-rotate-90' : 'rotate-0'
              )}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>

            {isAllDone ? (
              <span className="w-1 h-5 bg-emerald-500 rounded-full shrink-0" />
            ) : (
              <span className="w-1 h-5 bg-blue-500 rounded-full shrink-0" />
            )}

            <span className="text-sm">{getIcon(type)}</span>
            <h3 className={cn(
              'text-sm font-bold truncate',
              isAllDone ? 'text-zinc-500' : 'text-white'
            )}>
              {type}
            </h3>

            {isAllDone && (
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full font-bold uppercase tracking-wider shrink-0">
                Done ✓
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-600 font-medium shrink-0">
            {completedCount}/{docs.length}
          </span>
        </div>
      </div>

      {!isCollapsed && (
        <Card className="mb-4 bg-transparent border-0 md:bg-zinc-950 md:border">
          <div className={cn(
             viewMode === 'grid' 
               ? "grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 p-0 md:p-3" 
               : "divide-y divide-zinc-800/60"
          )}>
            {docs.map(doc => (
               <DocumentItem 
                 key={doc.id}
                 doc={doc}
                 state={state}
                 onDocClick={onDocClick}
                 toggleDoc={toggleDoc}
                 viewMode={viewMode}
               />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}


/* ─── Main Content ─────────────────────────────────────────── */

function DocumentsContent() {
  const searchParams = useSearchParams();
  const initialSection = searchParams.get('section') || documentSections[0];

  const { state, isLoaded, toggleDoc, toggleCategory, isCategoryCollapsed, setDocumentViewMode } = useApp();
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [timingFilter, setTimingFilter] = useState<'All' | 'Pre-Listing' | 'Ongoing' | 'Post-Listing'>('All');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'incomplete' | 'complete'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentArtifact | null>(null);
  
  const viewMode = state.documentViewMode || 'list';

  // Compute per-section stats for tab strip
  const sectionStats = useMemo(() => {
    const out: Record<string, { pct: number; missingRequired: number }> = {};
    for (const section of documentSections) {
      const docs = documentationData.filter(d => d.section === section);
      const total = docs.length;
      const completed = docs.filter(d => state.completedDocIds.includes(d.id)).length;
      const missingReq = docs.filter(d => d.timing === 'Pre-Listing' && !state.completedDocIds.includes(d.id)).length;
      out[section] = {
        pct: total > 0 ? Math.round((completed / total) * 100) : 0,
        missingRequired: missingReq,
      };
    }
    return out;
  }, [state.completedDocIds]);

  // Global missing required alert stats
  const missingRequiredTotal = useMemo(() => {
    return documentationData.filter(d => d.timing === 'Pre-Listing' && !state.completedDocIds.includes(d.id)).length;
  }, [state.completedDocIds]);

  // Docs for active section
  const sectionDocs = useMemo(() => documentationData.filter(d => d.section === selectedSection), [selectedSection]);

  // Filtered docs
  const filteredDocs = useMemo(() => {
    let docs = [...sectionDocs];

    if (timingFilter !== 'All') {
      docs = docs.filter(d => d.timing === timingFilter);
    }
    if (completionFilter === 'complete') {
      docs = docs.filter(d => state.completedDocIds.includes(d.id));
    } else if (completionFilter === 'incomplete') {
      docs = docs.filter(d => !state.completedDocIds.includes(d.id));
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      docs = docs.filter(d =>
        d.artifact.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term) ||
        d.type.toLowerCase().includes(term)
      );
    }
    return docs;
  }, [sectionDocs, timingFilter, completionFilter, searchTerm, state.completedDocIds]);

  // Group by type
  const groupedDocs = useMemo(() => {
    return filteredDocs.reduce((acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    }, {} as Record<string, DocumentArtifact[]>);
  }, [filteredDocs]);

  // Section summary stats
  const currentSectionStats = useMemo(() => {
    const total = sectionDocs.length;
    const completed = sectionDocs.filter(d => state.completedDocIds.includes(d.id)).length;
    return {
      total, completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [sectionDocs, state.completedDocIds]);

  // Auto-collapse logic when switching sections
  useEffect(() => {
    const groups = filteredDocs.reduce((acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    }, {} as Record<string, DocumentArtifact[]>);
    
    for (const [type, docs] of Object.entries(groups)) {
      const allDone = docs.every(d => state.completedDocIds.includes(d.id));
      const key = `doc::${selectedSection}::${type}`;
      if (allDone && !isCategoryCollapsed(key)) {
        toggleCategory(key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection]);


  if (!isLoaded) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const handleDocClick = (doc: DocumentArtifact, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
    if ((e.target as HTMLElement).closest('a')) return;
    setSelectedDoc(doc);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-zinc-950 overflow-hidden pt-14 lg:pt-0 pb-[80px] lg:pb-0">
      {/* Left Pane - List */}
      <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <header className="mb-5 lg:pt-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5 leading-tight">
              <span className="text-2xl">📄</span>
              Repository
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Track and build every required artifact for the property.</p>
          </header>

          {missingRequiredTotal > 0 && (
            <Card className="mb-5 bg-amber-500/10 border-amber-500/30">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-amber-400 mb-0.5 truncate">
                      {missingRequiredTotal} Pre-Listing Missing
                    </p>
                    <p className="text-[11px] text-amber-400/80 uppercase tracking-widest font-semibold flex items-center gap-2">
                      Check tabs with <span className="w-3 h-3 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[8px] font-bold">!</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Section Tab Strip ── */}
          <div className="mb-5">
            <SectionTabStrip
              sections={documentSections}
              selectedSection={selectedSection}
              onSelect={(s) => {
                setSelectedSection(s);
                setTimingFilter('All');
                setCompletionFilter('all');
                setSearchTerm('');
              }}
              sectionStats={sectionStats}
            />
          </div>

          {/* ── Active section progress bar ── */}
          <div className="mb-5 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest shrink-0">
                  {(selectedSection.match(/^\d+/) || ['00'])[0].padStart(2, '0')}
                </span>
                <h2 className="text-sm font-bold text-zinc-200 truncate">
                  {getDocShortSectionName(selectedSection)}
                </h2>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className={cn('text-lg font-extrabold', getProgressColor(currentSectionStats.percentage))}>
                  {currentSectionStats.percentage}%
                </span>
              </div>
            </div>
            <ProgressBar value={currentSectionStats.percentage} size="md" />
            <p className="text-xs text-zinc-600 mt-2">
              {currentSectionStats.completed} of {currentSectionStats.total} documents complete
            </p>
          </div>

          {/* ── Filter bar ── */}
          <div className="flex flex-col gap-3 mb-5 sticky top-0 z-20 bg-zinc-950 py-3 -mt-3">
            <div className="flex gap-1.5 flex-wrap">
              {(['All', 'Pre-Listing', 'Ongoing', 'Post-Listing'] as const).map(timing => (
                <Button
                  key={timing}
                  variant={timingFilter === timing ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTimingFilter(timing)}
                >
                  {timing}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-full min-w-0"
              />
              <div className="flex gap-1.5 shrink-0">
                {/* Grid/List Toggle */}
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden p-0.5 h-8">
                  <button 
                    onClick={() => setDocumentViewMode('list')}
                    className={cn("px-2 flex items-center justify-center transition-colors rounded-sm", viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                  <button 
                    onClick={() => setDocumentViewMode('grid')}
                    className={cn("px-2 flex items-center justify-center transition-colors rounded-sm", viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    Object.keys(groupedDocs).forEach(type => {
                      const key = `doc::${selectedSection}::${type}`;
                      if (!isCategoryCollapsed(key)) toggleCategory(key);
                    });
                  }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 px-2 rounded-md hover:bg-zinc-800 transition-all border border-zinc-800"
                >
                  Collapse
                </button>
              </div>
            </div>
          </div>

          {/* ── Document List ── */}
        {Object.entries(groupedDocs).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              {searchTerm ? (
                <>
                  <p className="text-zinc-500 font-medium mb-1">No documents match '{searchTerm}'</p>
                  <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="mt-2 text-indigo-400">
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-3xl mb-3">🎉</p>
                  <p className="text-zinc-300 text-base font-semibold mb-1">Section complete!</p>
                  <p className="text-zinc-500 text-sm">Every required document is ready.</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1">
            {Object.entries(groupedDocs).map(([type, docs]) => {
              const key = `doc::${selectedSection}::${type}`;
              const collapsed = isCategoryCollapsed(key);

              return (
                <TypeGroup
                  key={type}
                  type={type}
                  docs={docs}
                  state={state}
                  isCollapsed={collapsed}
                  onToggleCollapse={() => toggleCategory(key)}
                  onDocClick={handleDocClick}
                  toggleDoc={toggleDoc}
                  viewMode={viewMode}
                />
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Right Pane - Persistent Viewer */}
      <div className="hidden lg:flex flex-1 flex-col bg-zinc-950/40 relative h-full min-w-0">
        {selectedDoc ? (
          <DocumentViewerPane doc={selectedDoc} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 select-none">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-zinc-400">Ready to Review</p>
            <p className="text-sm mt-1">Select an artifact from the list to view files and notes.</p>
          </div>
        )}
      </div>

      {/* Mobile Viewer Overlay */}
      {selectedDoc && (
        <div className="lg:hidden fixed inset-0 z-50 bg-zinc-950 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
            <span className="font-bold text-sm text-zinc-200 line-clamp-1">{selectedDoc.artifact}</span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(null)} className="h-8 text-zinc-400 border border-zinc-800">
              Close
            </Button>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <DocumentViewerPane doc={selectedDoc} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500 text-sm">Loading repository...</div>}>
      <DocumentsContent />
    </Suspense>
  );
}
