'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';
import Fuse from 'fuse.js';
import type { Task, SearchScope } from '@/types';
import { cn } from '@/lib/utils';

interface EnhancedSearchProps {
  tasks: Task[];
  onSearch: (results: Task[], searchTerm: string) => void;
  placeholder?: string;
}

export function EnhancedSearch({ tasks, onSearch, placeholder = 'Search tasks...' }: EnhancedSearchProps) {
  const { state, addSearchHistory, clearSearchHistory } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Configure Fuse.js for fuzzy search
  const fuse = useRef<Fuse<Task>>();

  useEffect(() => {
    const fuseOptions = {
      keys: scope === 'all' 
        ? ['task', 'description', 'category', 'section']
        : scope === 'tasks'
        ? ['task']
        : scope === 'descriptions'
        ? ['description']
        : ['task'], // notes search handled separately
      threshold: 0.3, // 0 = exact match, 1 = match anything
      includeScore: true,
      minMatchCharLength: 2,
    };
    fuse.current = new Fuse(tasks, fuseOptions);
  }, [tasks, scope]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      onSearch(tasks, '');
      return;
    }

    if (scope === 'notes') {
      // Search in notes metadata
      const filtered = tasks.filter(t => {
        const note = state.taskMeta[t.id]?.note || '';
        return note.toLowerCase().includes(searchTerm.toLowerCase());
      });
      onSearch(filtered, searchTerm);
      return;
    }

    // Use fuzzy search
    if (fuse.current) {
      const results = fuse.current.search(searchTerm);
      const filtered = results.map(r => r.item);
      onSearch(filtered, searchTerm);
    }
  }, [searchTerm, scope, tasks, onSearch, state.taskMeta]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      addSearchHistory(searchTerm);
      setShowHistory(false);
    }
  };

  const handleHistorySelect = (term: string) => {
    setSearchTerm(term);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showHistory) return;
    
    const history = state.preferences.searchHistory;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => (prev < history.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => (prev > 0 ? prev - 1 : history.length - 1));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleHistorySelect(history[highlightIndex]);
    }
  };

  // Focus search on '/' key
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const resultCount = searchTerm.trim() ? tasks.length : 0;

  return (
    <div className="relative flex-1 sm:max-w-xs">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowHistory(state.preferences.searchHistory.length > 0)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-1.5 pr-8 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
        
        {/* Search icon / clear button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-zinc-500 hover:text-zinc-300 p-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>

      {/* Scope selector */}
      <div className="flex gap-1 mt-1.5">
        {(['all', 'tasks', 'descriptions', 'notes'] as SearchScope[]).map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-md transition-colors capitalize',
              scope === s
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                : 'bg-zinc-900 text-zinc-600 border border-zinc-800 hover:text-zinc-400'
            )}
          >
            {s}
          </button>
        ))}
        {searchTerm && (
          <span className="text-[10px] text-zinc-600 ml-auto self-center">
            {resultCount} results
          </span>
        )}
      </div>

      {/* Search history dropdown */}
      {showHistory && state.preferences.searchHistory.length > 0 && (
        <div
          ref={historyRef}
          className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-30 overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Recent Searches</span>
            <button
              onClick={clearSearchHistory}
              className="text-[10px] text-zinc-600 hover:text-zinc-400"
            >
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {state.preferences.searchHistory.map((term, idx) => (
              <button
                key={idx}
                onClick={() => handleHistorySelect(term)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2',
                  highlightIndex === idx && 'bg-zinc-800'
                )}
              >
                <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
