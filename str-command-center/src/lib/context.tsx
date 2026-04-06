'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppState, TaskMeta, TaskStatus } from '@/types';
import { loadState, saveState, DEFAULT_STATE, exportState, importState, clearState } from './storage';

interface AppContextType {
  state: AppState;
  // Task actions
  toggleTask: (taskId: number) => void;
  setTaskStatus: (taskId: number, status: TaskStatus) => void;
  setTaskNote: (taskId: number, note: string) => void;
  togglePin: (taskId: number) => void;
  // Document actions
  toggleDoc: (docId: string) => void;
  // Settings
  setLaunchDate: (date: string) => void;
  // Data management
  exportData: () => string;
  importData: (json: string) => { success: boolean; error?: string };
  resetAll: () => void;
  // Category collapse
  toggleCategory: (category: string) => void;
  isCategoryCollapsed: (category: string) => boolean;
  // Loading state
  isLoaded: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount (client-side only)
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setIsLoaded(true);
  }, []);

  // Persist state changes
  const persistState = useCallback((newState: AppState) => {
    setState(newState);
    saveState(newState);
  }, []);

  // Task actions
  const toggleTask = useCallback((taskId: number) => {
    setState(prev => {
      const isCompleted = prev.completedIds.includes(taskId);
      let newCompletedIds: number[];
      let newTaskMeta = { ...prev.taskMeta };

      if (isCompleted) {
        // Uncomplete
        newCompletedIds = prev.completedIds.filter(id => id !== taskId);
        if (newTaskMeta[taskId]) {
          delete newTaskMeta[taskId].completedAt;
        }
      } else {
        // Complete
        newCompletedIds = [...prev.completedIds, taskId];
        newTaskMeta[taskId] = {
          ...newTaskMeta[taskId],
          completedAt: new Date().toISOString(),
        };
      }

      const newState = { ...prev, completedIds: newCompletedIds, taskMeta: newTaskMeta };
      saveState(newState);
      return newState;
    });
  }, []);

  const setTaskStatus = useCallback((taskId: number, status: TaskStatus) => {
    setState(prev => {
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          status,
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      return newState;
    });
  }, []);

  const setTaskNote = useCallback((taskId: number, note: string) => {
    setState(prev => {
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          note,
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      return newState;
    });
  }, []);

  const togglePin = useCallback((taskId: number) => {
    setState(prev => {
      const isPinned = prev.pinnedIds.includes(taskId);
      const newPinnedIds = isPinned
        ? prev.pinnedIds.filter(id => id !== taskId)
        : [...prev.pinnedIds, taskId];
      const newState = { ...prev, pinnedIds: newPinnedIds };
      saveState(newState);
      return newState;
    });
  }, []);

  // Document actions
  const toggleDoc = useCallback((docId: string) => {
    setState(prev => {
      const isCompleted = prev.completedDocIds.includes(docId);
      const newCompletedDocIds = isCompleted
        ? prev.completedDocIds.filter(id => id !== docId)
        : [...prev.completedDocIds, docId];
      const newState = { ...prev, completedDocIds: newCompletedDocIds };
      saveState(newState);
      return newState;
    });
  }, []);

  // Settings
  const setLaunchDate = useCallback((date: string) => {
    setState(prev => {
      const newState = { ...prev, launchDate: date };
      saveState(newState);
      return newState;
    });
  }, []);

  // Data management
  const exportData = useCallback(() => {
    return exportState(state);
  }, [state]);

  const importData = useCallback((json: string) => {
    const result = importState(json);
    if (result.success && result.state) {
      persistState(result.state);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [persistState]);

  const resetAll = useCallback(() => {
    clearState();
    setState(DEFAULT_STATE);
  }, []);

  // Category collapse
  const toggleCategory = useCallback((category: string) => {
    setState(prev => {
      const isCollapsed = prev.collapsedCategories.includes(category);
      const newCollapsed = isCollapsed
        ? prev.collapsedCategories.filter(c => c !== category)
        : [...prev.collapsedCategories, category];
      const newState = { ...prev, collapsedCategories: newCollapsed };
      saveState(newState);
      return newState;
    });
  }, []);

  const isCategoryCollapsed = useCallback((category: string) => {
    return state.collapsedCategories.includes(category);
  }, [state.collapsedCategories]);

  const value: AppContextType = {
    state,
    toggleTask,
    setTaskStatus,
    setTaskNote,
    togglePin,
    toggleDoc,
    setLaunchDate,
    exportData,
    importData,
    resetAll,
    toggleCategory,
    isCategoryCollapsed,
    isLoaded,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
