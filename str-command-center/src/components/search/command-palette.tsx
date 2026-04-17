'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { allTasks } from '@/data/roadmap';
import { documentationData } from '@/data/documents';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchResult = {
  id: string;
  type: 'page' | 'task' | 'document' | 'section';
  title: string;
  subtitle?: string;
  href: string;
  icon: string;
};

const pages: SearchResult[] = [
  { id: 'dashboard', type: 'page', title: 'Dashboard', href: '/', icon: '📊' },
  { id: 'roadmap', type: 'page', title: 'Roadmap', href: '/roadmap', icon: '🗺️' },
  { id: 'documents', type: 'page', title: 'Documents', href: '/documents', icon: '📄' },
  { id: 'focus', type: 'page', title: 'Focus Mode', href: '/focus', icon: '⚡' },
  { id: 'settings', type: 'page', title: 'Settings', href: '/settings', icon: '⚙️' },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build search index
  const allResults = useMemo(() => {
    const results: SearchResult[] = [...pages];

    // Add tasks (limit to first 100 for performance)
    allTasks.slice(0, 100).forEach((task) => {
      results.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.task,
        subtitle: `${task.section} · ${task.category}`,
        href: `/roadmap?section=${encodeURIComponent(task.section)}`,
        icon: state.completedIds.includes(task.id) ? '✓' : '○',
      });
    });

    // Add documents
    documentationData.forEach((doc) => {
      results.push({
        id: `doc-${doc.id}`,
        type: 'document',
        title: doc.artifact,
        subtitle: `${doc.section} · ${doc.type}`,
        href: `/documents?search=${encodeURIComponent(doc.artifact)}`,
        icon: state.completedDocIds.includes(doc.id) ? '✓' : '📄',
      });
    });

    return results;
  }, [state.completedIds, state.completedDocIds]);

  // Filter results
  const filteredResults = useMemo(() => {
    if (!search.trim()) {
      return pages;
    }

    const query = search.toLowerCase();
    return allResults
      .filter((result) => {
        const matchTitle = result.title.toLowerCase().includes(query);
        const matchSubtitle = result.subtitle?.toLowerCase().includes(query);
        return matchTitle || matchSubtitle;
      })
      .slice(0, 8); // Limit results
  }, [search, allResults]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          navigate(filteredResults[selectedIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults]);

  const navigate = (result: SearchResult) => {
    router.push(result.href);
    setSearch('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-in slide-in-from-top-4 duration-200">
        <div className="mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-lg"
              placeholder="Search tasks, documents, pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <kbd className="hidden sm:inline-flex px-2 py-1 text-[10px] font-medium text-zinc-500 bg-zinc-800 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredResults.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                No results found for "{search}"
              </div>
            ) : (
              <div className="space-y-1">
                {filteredResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => navigate(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-blue-500 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    )}
                  >
                    <span className="text-xl">{result.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'text-sm font-medium truncate',
                        index === selectedIndex ? 'text-white' : 'text-zinc-200'
                      )}>
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className={cn(
                          'text-xs truncate mt-0.5',
                          index === selectedIndex ? 'text-blue-100' : 'text-zinc-500'
                        )}>
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    {result.type === 'page' && (
                      <div className={cn(
                        'text-[10px] uppercase tracking-wider font-medium',
                        index === selectedIndex ? 'text-blue-100' : 'text-zinc-600'
                      )}>
                        Page
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/50 text-[10px] text-zinc-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">↵</kbd>
                to select
              </span>
            </div>
            <span className="hidden sm:inline">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">⌘K</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
