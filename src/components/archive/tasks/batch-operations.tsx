'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';
import type { TaskStatus, TaskPriority } from '@/types';

interface BatchOperationsBarProps {
  selectedIds: number[];
  onClearSelection: () => void;
  onComplete: () => void;
  onSetStatus: (status: TaskStatus) => void;
  onSetPriority: (priority: TaskPriority) => void;
  onPin: () => void;
}

export function BatchOperationsBar({
  selectedIds,
  onClearSelection,
  onComplete,
  onSetStatus,
  onSetPriority,
  onPin,
}: BatchOperationsBarProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4">
      <div className="glass-heavy px-6 py-4 rounded-2xl border-2 border-zinc-700 shadow-strong min-w-[400px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                <span className="text-sm font-bold font-mono text-blue-400">{selectedIds.length}</span>
              </div>
              <span className="text-sm font-semibold text-zinc-300">
                {selectedIds.length === 1 ? '1 task selected' : `${selectedIds.length} tasks selected`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onComplete}
              className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium"
            >
              ✓ Complete
            </button>

            <button
              onClick={onPin}
              className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-sm font-medium"
            >
              📌 Pin
            </button>

            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-all text-sm font-medium"
              >
                Status ▾
              </button>
              
              {showStatusMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 glass-heavy rounded-xl border border-zinc-700 shadow-strong overflow-hidden">
                  {(['in-progress', 'blocked', 'na'] as TaskStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        onSetStatus(status);
                        setShowStatusMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors"
                    >
                      {status === 'in-progress' && '🔄 In Progress'}
                      {status === 'blocked' && '⚠️ Blocked'}
                      {status === 'na' && '➖ N/A'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClearSelection}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
              title="Clear selection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing multi-select state
 */
export function useMultiSelect() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const toggleSelection = useCallback((id: number, shiftKey: boolean = false) => {
    setIsSelecting(true);
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setIsSelecting(false);
  }, []);

  const selectAll = useCallback((ids: number[]) => {
    setSelectedIds(ids);
    setIsSelecting(true);
  }, []);

  return {
    selectedIds,
    isSelecting,
    toggleSelection,
    clearSelection,
    selectAll,
  };
}
