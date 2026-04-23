'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppState, TaskStatus, DocumentStatus } from '@/types';
import { loadState, saveState, DEFAULT_STATE, exportState, importState, clearState, getLocalUpdatedAt } from './storage';
import { clearRemoteState, isCloudSyncConfigured, loadRemoteState, saveRemoteState } from './supabase';

interface AppContextType {
  state: AppState;
  // Task actions
  toggleTask: (taskId: number) => void;
  setTaskStatus: (taskId: number, status: TaskStatus) => void;
  setTaskNote: (taskId: number, note: string) => void;
  setTaskPriority: (taskId: number, priority: import('@/types').TaskPriority) => void;
  setTaskEstimate: (taskId: number, minutes: number) => void;
  setTaskOwner: (taskId: number, owner: string) => void;
  togglePin: (taskId: number) => void;
  // Enhanced task actions
  addChecklistItem: (taskId: number, item: import('@/types').ChecklistItem) => void;
  toggleChecklistItem: (taskId: number, itemId: string) => void;
  removeChecklistItem: (taskId: number, itemId: string) => void;
  generateChecklist: (taskId: number, items: import('@/types').ChecklistItem[]) => void;
  linkDocument: (taskId: number, docId: string) => void;
  unlinkDocument: (taskId: number, docId: string) => void;
  attachFile: (taskId: number, file: import('@/types').AttachedFile) => void;
  removeFile: (taskId: number, fileId: string) => void;
  logActivity: (taskId: number, action: string, details?: string) => void;
  // Document actions
  toggleDoc: (docId: string) => void;
  setDocNote: (docId: string, note: string) => void;
  addDocAttachment: (docId: string, attachment: { id: string; name: string; size: number; type: string }) => void;
  removeDocAttachment: (docId: string, attachmentId: string) => void;
  patchDocAttachment: (
    docId: string,
    attachmentId: string,
    patch: Partial<{ hash: string; storagePath: string; source: 'local' | 'cloud' | 'hybrid' }>
  ) => void;
  updateDocStatus: (docId: string, status: DocumentStatus) => void;
  appendAuditLog: (docId: string, action: string, actor: string) => void;
  setSmartTags: (docId: string, tags: { key: string; value: string }[]) => void;
  upsertFileRegistryRecord: (record: import('@/types').FileRegistryRecord) => void;
  setDocumentViewMode: (mode: 'list' | 'grid') => void;
  // Settings
  setLaunchDate: (date: string) => void;
  // Data management
  exportData: () => string;
  importData: (json: string) => { success: boolean; error?: string };
  resetAll: () => void;
  // Category collapse
  toggleCategory: (category: string) => void;
  isCategoryCollapsed: (category: string) => boolean;
  // Preferences
  toggleAutoCollapse: () => void;
  toggleCategoryLock: (category: string) => void;
  isCategoryLocked: (category: string) => boolean;
  addSearchHistory: (term: string) => void;
  clearSearchHistory: () => void;
  setExpandAllForSection: (section: string, expanded: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  // Activity log
  getRecentActivity: (limit?: number) => import('@/types').ActivityEntry[];
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
      
      // Apply theme on initial load
      const theme = loaded.preferences?.theme || 'light';
      const root = document.documentElement;
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark-theme', prefersDark);
      } else {
        root.classList.toggle('dark-theme', theme === 'dark');
      }

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
      const now = new Date().toISOString();

      if (isCompleted) {
        // Uncomplete
        newCompletedIds = prev.completedIds.filter(id => id !== taskId);
        const existingMeta = newTaskMeta[taskId] || {};
        const { completedAt: _removed, ...metaWithoutDate } = existingMeta;
        const taskActivityLog = metaWithoutDate.activityLog || [];
        newTaskMeta[taskId] = {
          ...metaWithoutDate,
          activityLog: [{ id: crypto.randomUUID(), action: 'Marked incomplete', timestamp: now }, ...taskActivityLog],
        };
      } else {
        // Complete — also clear blocked/in-progress status so it leaves those columns
        const existingMeta = newTaskMeta[taskId] || {};
        const currentStatus = existingMeta.status;
        const taskActivityLog = existingMeta.activityLog || [];
        newTaskMeta[taskId] = {
          ...existingMeta,
          completedAt: now,
          // Auto-clear active statuses — completed tasks don't stay blocked/in-progress
          status: (currentStatus === 'blocked' || currentStatus === 'in-progress') ? 'default' : currentStatus,
          activityLog: [{ id: crypto.randomUUID(), action: 'Marked complete', timestamp: now }, ...taskActivityLog],
        };
        newCompletedIds = [...prev.completedIds, taskId];
      }

      // Append to global activity log
      const globalEntry: import('@/types').ActivityEntry = {
        id: crypto.randomUUID(),
        type: isCompleted ? 'task_uncomplete' : 'task_complete',
        taskId,
        label: isCompleted ? 'Task uncompleted' : 'Task completed',
        section: '',
        timestamp: now,
      };
      const newActivityLog = [globalEntry, ...(prev.activityLog || [])].slice(0, 200);

      const newState = { ...prev, completedIds: newCompletedIds, taskMeta: newTaskMeta, activityLog: newActivityLog };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const setTaskStatus = useCallback((taskId: number, status: TaskStatus) => {
    setState(prev => {
      const now = new Date().toISOString();
      const existingMeta = prev.taskMeta[taskId] || {};
      const taskActivityLog = existingMeta.activityLog || [];
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...existingMeta,
          status,
          activityLog: [{ id: crypto.randomUUID(), action: `Status → ${status}`, timestamp: now }, ...taskActivityLog],
        },
      };
      // Append to global activity log
      const globalEntry: import('@/types').ActivityEntry = {
        id: crypto.randomUUID(),
        type: 'task_status',
        taskId,
        label: `Status set to ${status}`,
        section: '',
        timestamp: now,
        newValue: status,
      };
      const newActivityLog = [globalEntry, ...(prev.activityLog || [])].slice(0, 200);
      const newState = { ...prev, taskMeta: newTaskMeta, activityLog: newActivityLog };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const setTaskNote = useCallback((taskId: number, note: string) => {
    setState(prev => {
      const now = new Date().toISOString();
      const existingMeta = prev.taskMeta[taskId] || {};
      const taskActivityLog = existingMeta.activityLog || [];
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...existingMeta,
          note,
          activityLog: note
            ? [{ id: crypto.randomUUID(), action: 'Note updated', timestamp: now }, ...taskActivityLog]
            : taskActivityLog,
        },
      };
      // Append to global activity log only if note is non-empty
      const newActivityLog = note
        ? [{ id: crypto.randomUUID(), type: 'task_note' as const, taskId, label: 'Note added', section: '', timestamp: now }, ...(prev.activityLog || [])].slice(0, 200)
        : prev.activityLog;
      const newState = { ...prev, taskMeta: newTaskMeta, activityLog: newActivityLog };
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
        
      const newStatus = isCompleted ? 'missing' : 'verified';
      const newDocMeta = {
        ...prev.docMeta,
        [docId]: {
          ...prev.docMeta[docId],
          status: newStatus as DocumentStatus,
        },
      };

      const newState = { ...prev, completedDocIds: newCompletedDocIds, docMeta: newDocMeta };
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

  const addDocAttachment = useCallback((docId: string, attachment: { id: string; name: string; size: number; type: string }) => {
    setState(prev => {
      const currentAttachments = prev.docMeta[docId]?.attachments || [];
      const newDocMeta = {
        ...prev.docMeta,
        [docId]: {
          ...prev.docMeta[docId],
          attachments: [
            ...currentAttachments,
            { ...attachment, attachedAt: new Date().toISOString() },
          ],
        },
      };
      const newState = { ...prev, docMeta: newDocMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const removeDocAttachment = useCallback((docId: string, attachmentId: string) => {
    setState(prev => {
      const currentAttachments = prev.docMeta[docId]?.attachments || [];
      const newDocMeta = {
        ...prev.docMeta,
        [docId]: {
          ...prev.docMeta[docId],
          attachments: currentAttachments.filter(a => a.id !== attachmentId),
        },
      };
      const newState = { ...prev, docMeta: newDocMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  // Apply persisted theme preference globally.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const theme = state.preferences?.theme || 'dark';
    document.documentElement.classList.toggle('light-theme', theme === 'light');
  }, [state.preferences?.theme]);

  const patchDocAttachment = useCallback((
    docId: string,
    attachmentId: string,
    patch: Partial<{ hash: string; storagePath: string; source: 'local' | 'cloud' | 'hybrid' }>
  ) => {
    setState(prev => {
      const currentAttachments = prev.docMeta[docId]?.attachments || [];
      const patched = currentAttachments.map(attachment =>
        attachment.id === attachmentId ? { ...attachment, ...patch } : attachment
      );

      const newDocMeta = {
        ...prev.docMeta,
        [docId]: {
          ...prev.docMeta[docId],
          attachments: patched,
        },
      };
      const newState = { ...prev, docMeta: newDocMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const updateDocStatus = useCallback((docId: string, status: DocumentStatus) => {
    setState(prev => {
      const newDocMeta = {
        ...prev.docMeta,
        [docId]: {
          ...prev.docMeta[docId],
          status,
        },
      };
      // Keep legacy completedDocIds in sync
      const isCurrentlyCompleted = prev.completedDocIds.includes(docId);
      let newCompletedDocIds = prev.completedDocIds;
      if (status === 'verified' && !isCurrentlyCompleted) {
        newCompletedDocIds = [...prev.completedDocIds, docId];
      } else if (status !== 'verified' && isCurrentlyCompleted) {
        newCompletedDocIds = prev.completedDocIds.filter(id => id !== docId);
      }

      const newState = { ...prev, docMeta: newDocMeta, completedDocIds: newCompletedDocIds };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const appendAuditLog = useCallback((docId: string, action: string, actor: string) => {
    setState(prev => {
      const currentLog = prev.docMeta[docId]?.auditLog || [];
      const newLogEntry = {
        id: crypto.randomUUID(),
        action,
        actor,
        timestamp: new Date().toISOString(),
      };
      const newDocMeta = {
        ...prev.docMeta,
        [docId]: {
          ...prev.docMeta[docId],
          auditLog: [newLogEntry, ...currentLog], // Prepend to show newest first!
        },
      };
      const newState = { ...prev, docMeta: newDocMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const setSmartTags = useCallback((docId: string, tags: { key: string; value: string }[]) => {
    setState(prev => {
      const newDocMeta = {
        ...prev.docMeta,
        [docId]: {
          ...prev.docMeta[docId],
          smartTags: tags,
        },
      };
      const newState = { ...prev, docMeta: newDocMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const upsertFileRegistryRecord = useCallback((record: import('@/types').FileRegistryRecord) => {
    setState(prev => {
      const existing = prev.fileRegistry?.[record.id];
      const merged: import('@/types').FileRegistryRecord = existing
        ? {
            ...existing,
            ...record,
            linkedDocIds: Array.from(new Set([...(existing.linkedDocIds || []), ...(record.linkedDocIds || [])])),
          }
        : record;

      const newState = {
        ...prev,
        fileRegistry: {
          ...(prev.fileRegistry || {}),
          [record.id]: merged,
        },
      };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const setDocumentViewMode = useCallback((mode: 'list' | 'grid') => {
    setState(prev => {
      const newState = { ...prev, documentViewMode: mode };
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

  // New task metadata actions
  const setTaskPriority = useCallback((taskId: number, priority: import('@/types').TaskPriority) => {
    setState(prev => {
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: { ...prev.taskMeta[taskId], priority },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const setTaskEstimate = useCallback((taskId: number, minutes: number) => {
    setState(prev => {
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: { ...prev.taskMeta[taskId], estimatedMinutes: minutes },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const setTaskOwner = useCallback((taskId: number, owner: string) => {
    setState(prev => {
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: { ...prev.taskMeta[taskId], owner },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  // Preferences
  const toggleAutoCollapse = useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        preferences: {
          ...DEFAULT_STATE.preferences,
          ...prev.preferences,
          autoCollapseCompleted: !(prev.preferences?.autoCollapseCompleted ?? false),
        },
      };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const toggleCategoryLock = useCallback((category: string) => {
    setState(prev => {
      const lockedCategories = prev.preferences?.lockedCategories ?? [];
      const isLocked = lockedCategories.includes(category);
      const newLocked = isLocked
        ? lockedCategories.filter(c => c !== category)
        : [...lockedCategories, category];
      const newState = {
        ...prev,
        preferences: { 
          ...DEFAULT_STATE.preferences, 
          ...prev.preferences, 
          lockedCategories: newLocked 
        },
      };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const isCategoryLocked = useCallback((category: string) => {
    return state.preferences?.lockedCategories?.includes(category) ?? false;
  }, [state.preferences?.lockedCategories]);

  const addSearchHistory = useCallback((term: string) => {
    if (!term.trim()) return;
    setState(prev => {
      const searchHistory = prev.preferences?.searchHistory ?? [];
      const history = [term, ...searchHistory.filter(t => t !== term)].slice(0, 10);
      const newState = {
        ...prev,
        preferences: { 
          ...DEFAULT_STATE.preferences, 
          ...prev.preferences, 
          searchHistory: history 
        },
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        preferences: { 
          ...DEFAULT_STATE.preferences, 
          ...prev.preferences, 
          searchHistory: [] 
        },
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const setExpandAllForSection = useCallback((section: string, expanded: boolean) => {
    setState(prev => {
      const expandAllBySection = prev.preferences?.expandAllBySection ?? {};
      const newState = {
        ...prev,
        preferences: {
          ...DEFAULT_STATE.preferences,
          ...prev.preferences,
          expandAllBySection: { ...expandAllBySection, [section]: expanded },
        },
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setState(prev => {
      const newState = {
        ...prev,
        preferences: {
          ...DEFAULT_STATE.preferences,
          ...prev.preferences,
          theme,
        },
      };
      saveState(newState);
      void syncRemoteState(newState);
      
      // Apply theme to HTML element
      if (typeof window !== 'undefined') {
        const root = document.documentElement;
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark-theme', prefersDark);
        } else {
          root.classList.toggle('dark-theme', theme === 'dark');
        }
      }
      
      return newState;
    });
  }, [syncRemoteState]);

  // Undo/Redo
  const createUndoEntry = useCallback((action: string, prev: AppState, next: AppState): import('@/types').UndoEntry => {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      previousState: { completedIds: prev.completedIds, taskMeta: prev.taskMeta, pinnedIds: prev.pinnedIds },
      newState: { completedIds: next.completedIds, taskMeta: next.taskMeta, pinnedIds: next.pinnedIds },
    };
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.undoStack.length === 0) return prev;
      const entry = prev.undoStack[prev.undoStack.length - 1];
      const newState = {
        ...prev,
        ...entry.previousState,
        undoStack: prev.undoStack.slice(0, -1),
        redoStack: [...prev.redoStack, entry],
      };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.redoStack.length === 0) return prev;
      const entry = prev.redoStack[prev.redoStack.length - 1];
      const newState = {
        ...prev,
        ...entry.newState,
        redoStack: prev.redoStack.slice(0, -1),
        undoStack: [...prev.undoStack, entry],
      };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const canUndo = state.undoStack.length > 0;
  const canRedo = state.redoStack.length > 0;

  // Activity log
  const getRecentActivity = useCallback((limit = 20) => {
    return state.activityLog.slice(0, limit);
  }, [state.activityLog]);

  // Enhanced task actions - Checklist management
  const addChecklistItem = useCallback((taskId: number, item: import('@/types').ChecklistItem) => {
    setState(prev => {
      const currentItems = prev.taskMeta[taskId]?.checklistItems || [];
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          checklistItems: [...currentItems, item],
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const toggleChecklistItem = useCallback((taskId: number, itemId: string) => {
    setState(prev => {
      const currentItems = prev.taskMeta[taskId]?.checklistItems || [];
      const updatedItems = currentItems.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      
      // Check if all items are completed
      const isVerified = updatedItems.length > 0 && updatedItems.every(item => item.completed);
      
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          checklistItems: updatedItems,
          isVerifiedComplete: isVerified,
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const removeChecklistItem = useCallback((taskId: number, itemId: string) => {
    setState(prev => {
      const currentItems = prev.taskMeta[taskId]?.checklistItems || [];
      const updatedItems = currentItems.filter(item => item.id !== itemId);
      
      const isVerified = updatedItems.length > 0 && updatedItems.every(item => item.completed);
      
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          checklistItems: updatedItems,
          isVerifiedComplete: isVerified,
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const generateChecklist = useCallback((taskId: number, items: import('@/types').ChecklistItem[]) => {
    setState(prev => {
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          checklistItems: items,
          isVerifiedComplete: false,
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  // Document linking
  const linkDocument = useCallback((taskId: number, docId: string) => {
    setState(prev => {
      const currentDocs = prev.taskMeta[taskId]?.linkedDocuments || [];
      if (currentDocs.includes(docId)) return prev; // Already linked
      
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          linkedDocuments: [...currentDocs, docId],
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const unlinkDocument = useCallback((taskId: number, docId: string) => {
    setState(prev => {
      const currentDocs = prev.taskMeta[taskId]?.linkedDocuments || [];
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          linkedDocuments: currentDocs.filter(id => id !== docId),
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  // File attachment
  const attachFile = useCallback((taskId: number, file: import('@/types').AttachedFile) => {
    setState(prev => {
      const currentFiles = prev.taskMeta[taskId]?.attachedFiles || [];
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          attachedFiles: [...currentFiles, file],
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const removeFile = useCallback((taskId: number, fileId: string) => {
    setState(prev => {
      const currentFiles = prev.taskMeta[taskId]?.attachedFiles || [];
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          attachedFiles: currentFiles.filter(f => f.id !== fileId),
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  // Activity logging
  const logActivity = useCallback((taskId: number, action: string, details?: string) => {
    setState(prev => {
      const currentLog = prev.taskMeta[taskId]?.activityLog || [];
      const newEntry: import('@/types').TaskActivityEntry = {
        id: crypto.randomUUID(),
        action,
        timestamp: new Date().toISOString(),
        details,
      };
      const newTaskMeta = {
        ...prev.taskMeta,
        [taskId]: {
          ...prev.taskMeta[taskId],
          activityLog: [newEntry, ...currentLog], // Prepend newest first
        },
      };
      const newState = { ...prev, taskMeta: newTaskMeta };
      saveState(newState);
      void syncRemoteState(newState);
      return newState;
    });
  }, [syncRemoteState]);

  const value: AppContextType = {
    state,
    toggleTask,
    setTaskStatus,
    setTaskNote,
    setTaskPriority,
    setTaskEstimate,
    setTaskOwner,
    togglePin,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    generateChecklist,
    linkDocument,
    unlinkDocument,
    attachFile,
    removeFile,
    logActivity,
    toggleDoc,
    setDocNote,
    addDocAttachment,
    removeDocAttachment,
    patchDocAttachment,
    updateDocStatus,
    appendAuditLog,
    setSmartTags,
    upsertFileRegistryRecord,
    setDocumentViewMode,
    setLaunchDate,
    exportData,
    importData,
    resetAll,
    toggleCategory,
    isCategoryCollapsed,
    toggleAutoCollapse,
    toggleCategoryLock,
    isCategoryLocked,
    addSearchHistory,
    clearSearchHistory,
    setExpandAllForSection,
    setTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    getRecentActivity,
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
