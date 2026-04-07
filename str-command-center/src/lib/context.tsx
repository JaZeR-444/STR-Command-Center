'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppState, TaskStatus } from '@/types';
import { loadState, saveState, DEFAULT_STATE, exportState, importState, clearState, getLocalUpdatedAt } from './storage';
import { clearRemoteState, isCloudSyncConfigured, loadRemoteState, saveRemoteState } from './supabase';

interface AppContextType {
  state: AppState;
  // Task actions
  toggleTask: (taskId: number) => void;
  setTaskStatus: (taskId: number, status: TaskStatus) => void;
  setTaskNote: (taskId: number, note: string) => void;
  togglePin: (taskId: number) => void;
  // Document actions
  toggleDoc: (docId: string) => void;
  setDocNote: (docId: string, note: string) => void;
  setDocAttachment: (docId: string, fileName?: string, fileSize?: number) => void;
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
  cloudSyncStatus: 'disabled' | 'connecting' | 'online' | 'error';
  cloudSyncMessage: string | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'disabled' | 'connecting' | 'online' | 'error'>(
    isCloudSyncConfigured() ? 'connecting' : 'disabled'
  );
  const [cloudSyncMessage, setCloudSyncMessage] = useState<string | null>(null);

  const syncRemoteState = useCallback(async (newState: AppState) => {
    if (!isCloudSyncConfigured()) return;

    const result = await saveRemoteState(newState);
    if (!result.success) {
      setCloudSyncStatus('error');
      setCloudSyncMessage(result.error || 'Cloud sync failed');
      return;
    }

    setCloudSyncStatus('online');
    setCloudSyncMessage(result.updatedAt ? `Last cloud sync: ${new Date(result.updatedAt).toLocaleString()}` : 'Cloud sync active');
  }, []);

  // Load state from localStorage on mount (client-side only)
  useEffect(() => {
    const bootstrap = async () => {
      const loaded = loadState();
      setState(loaded);
      setIsLoaded(true);

      if (!isCloudSyncConfigured()) {
        setCloudSyncStatus('disabled');
        setCloudSyncMessage('Cloud sync disabled (env vars not set)');
        return;
      }

      setCloudSyncStatus('connecting');
      const remote = await loadRemoteState();

      if (remote.error && remote.error !== 'Supabase not configured') {
        setCloudSyncStatus('error');
        setCloudSyncMessage(`Cloud sync unavailable: ${remote.error}`);
        return;
      }

      const localMs = Date.parse(getLocalUpdatedAt() || '');
      const remoteMs = Date.parse(remote.updatedAt || '');

      if (remote.state && remoteMs > localMs) {
        setState(remote.state);
        saveState(remote.state);
      } else {
        void syncRemoteState(loaded);
      }

      setCloudSyncStatus('online');
      setCloudSyncMessage(remote.updatedAt ? `Last cloud sync: ${new Date(remote.updatedAt).toLocaleString()}` : 'Cloud sync active');
    };

    void bootstrap();
  }, [syncRemoteState]);

  // Persist state changes
  const persistState = useCallback((newState: AppState) => {
    setState(newState);
    saveState(newState);
    void syncRemoteState(newState);
  }, [syncRemoteState]);

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
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

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
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

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
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const togglePin = useCallback((taskId: number) => {
    setState(prev => {
      const isPinned = prev.pinnedIds.includes(taskId);
      const newPinnedIds = isPinned
        ? prev.pinnedIds.filter(id => id !== taskId)
        : [...prev.pinnedIds, taskId];
      const newState = { ...prev, pinnedIds: newPinnedIds };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  // Document actions
  const toggleDoc = useCallback((docId: string) => {
    setState(prev => {
      const isCompleted = prev.completedDocIds.includes(docId);
      const newCompletedDocIds = isCompleted
        ? prev.completedDocIds.filter(id => id !== docId)
        : [...prev.completedDocIds, docId];
      const newState = { ...prev, completedDocIds: newCompletedDocIds };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const setDocNote = useCallback((docId: string, note: string) => {
    setState(prev => {
      const newDocMeta = {
        ...prev.docMeta,
        [docId]: {
          ...prev.docMeta[docId],
          note,
        },
      };
      const newState = { ...prev, docMeta: newDocMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const setDocAttachment = useCallback((docId: string, fileName?: string, fileSize?: number) => {
    setState(prev => {
      const newDocMeta = {
        ...prev.docMeta,
        [docId]: {
          ...prev.docMeta[docId],
          attachedFileName: fileName,
          attachedFileSize: fileSize,
          attachedAt: fileName ? new Date().toISOString() : undefined,
        },
      };
      const newState = { ...prev, docMeta: newDocMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  // Settings
  const setLaunchDate = useCallback((date: string) => {
    setState(prev => {
      const newState = { ...prev, launchDate: date };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

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
    if (isCloudSyncConfigured()) {
      void clearRemoteState();
    }
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
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

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
    setDocNote,
    setDocAttachment,
    setLaunchDate,
    exportData,
    importData,
    resetAll,
    toggleCategory,
    isCategoryCollapsed,
    isLoaded,
    cloudSyncStatus,
    cloudSyncMessage,
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
