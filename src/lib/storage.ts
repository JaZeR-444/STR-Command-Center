// Storage utilities for persisting state to localStorage
import type { AppState, TaskMeta } from '@/types';
import { roadmapData } from '@/data/roadmap';
import { documentationData } from '@/data/documents';

const STORAGE_PREFIX = 'str_cc_';

const STORAGE_KEYS = {
  completedIds: `${STORAGE_PREFIX}completedIds`,
  completedDocIds: `${STORAGE_PREFIX}completedDocIds`,
  taskMeta: `${STORAGE_PREFIX}taskMeta`,
  docMeta: `${STORAGE_PREFIX}docMeta`,
  pinnedIds: `${STORAGE_PREFIX}pinnedIds`,
  launchDate: `${STORAGE_PREFIX}launchDate`,
  collapsedCategories: `${STORAGE_PREFIX}collapsedCats`,
  updatedAt: `${STORAGE_PREFIX}updatedAt`,
} as const;

// Valid ID sets for validation
const TASK_ID_SET = new Set(roadmapData.map(t => t.id));
const DOC_ID_SET = new Set(documentationData.map(d => d.id));

// Default empty state
export const DEFAULT_STATE: AppState = {
  completedIds: [],
  completedDocIds: [],
  taskMeta: {},
  docMeta: {},
  pinnedIds: [],
  launchDate: '2026-05-15',
  collapsedCategories: [],
  activityLog: [],
  undoStack: [],
  redoStack: [],
  preferences: {
    autoCollapseCompleted: false,
    lockedCategories: [],
    searchHistory: [],
    expandAllBySection: {},
  },
  fileRegistry: {},
};

// Safe JSON parse
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// Read from localStorage (client-side only)
export function loadState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  
  try {
    const completedIds = safeJsonParse<number[]>(
      localStorage.getItem(STORAGE_KEYS.completedIds),
      []
    ).filter(id => TASK_ID_SET.has(id));

    const completedDocIds = safeJsonParse<string[]>(
      localStorage.getItem(STORAGE_KEYS.completedDocIds),
      []
    ).filter(id => DOC_ID_SET.has(id));

    const rawMeta = safeJsonParse<Record<string, TaskMeta>>(
      localStorage.getItem(STORAGE_KEYS.taskMeta),
      {}
    );
    
    // Normalize taskMeta - only keep valid task IDs
    const taskMeta: Record<number, TaskMeta> = {};
    Object.entries(rawMeta).forEach(([key, value]) => {
      const taskId = Number(key);
      if (TASK_ID_SET.has(taskId) && value) {
        taskMeta[taskId] = {
          note: typeof value.note === 'string' ? value.note : '',
          status: ['default', 'blocked', 'in-progress', 'na'].includes(value.status || '') 
            ? value.status 
            : 'default',
          completedAt: typeof value.completedAt === 'string' ? value.completedAt : undefined,
        };
      }
    });

    const pinnedIds = safeJsonParse<number[]>(
      localStorage.getItem(STORAGE_KEYS.pinnedIds),
      []
    ).filter(id => TASK_ID_SET.has(id));

    const launchDate = localStorage.getItem(STORAGE_KEYS.launchDate) || DEFAULT_STATE.launchDate;

    const collapsedCategories = safeJsonParse<string[]>(
      localStorage.getItem(STORAGE_KEYS.collapsedCategories),
      []
    );

    const docMeta = safeJsonParse<Record<string, import('@/types').DocMeta>>(
      localStorage.getItem(STORAGE_KEYS.docMeta),
      {}
    );

    const activityLog = safeJsonParse<import('@/types').ActivityEntry[]>(
      localStorage.getItem(`${STORAGE_PREFIX}activityLog`),
      []
    ).slice(0, 100); // Keep last 100 entries

    const preferences = {
      ...DEFAULT_STATE.preferences,
      ...safeJsonParse<import('@/types').UserPreferences>(
        localStorage.getItem(`${STORAGE_PREFIX}preferences`),
        DEFAULT_STATE.preferences
      ),
    };

    return {
      completedIds,
      completedDocIds,
      taskMeta,
      docMeta,
      pinnedIds,
      launchDate,
      collapsedCategories,
      activityLog,
      undoStack: [], // Don't persist undo stack
      redoStack: [], // Don't persist redo stack
      preferences,
      fileRegistry: safeJsonParse<Record<string, import('@/types').FileRegistryRecord>>(
        localStorage.getItem(`${STORAGE_PREFIX}fileRegistry`),
        {}
      ),
    };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return DEFAULT_STATE;
  }
}

// Save to localStorage
export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.completedIds, JSON.stringify(state.completedIds));
    localStorage.setItem(STORAGE_KEYS.completedDocIds, JSON.stringify(state.completedDocIds));
    localStorage.setItem(STORAGE_KEYS.taskMeta, JSON.stringify(state.taskMeta));
    localStorage.setItem(STORAGE_KEYS.docMeta, JSON.stringify(state.docMeta));
    localStorage.setItem(STORAGE_KEYS.pinnedIds, JSON.stringify(state.pinnedIds));
    localStorage.setItem(STORAGE_KEYS.launchDate, state.launchDate);
    localStorage.setItem(STORAGE_KEYS.collapsedCategories, JSON.stringify(state.collapsedCategories));
    localStorage.setItem(`${STORAGE_PREFIX}activityLog`, JSON.stringify(state.activityLog.slice(0, 100)));
    localStorage.setItem(`${STORAGE_PREFIX}preferences`, JSON.stringify(state.preferences));
    localStorage.setItem(`${STORAGE_PREFIX}fileRegistry`, JSON.stringify(state.fileRegistry || {}));
    localStorage.setItem(STORAGE_KEYS.updatedAt, new Date().toISOString());
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

// Local state timestamp used for local/cloud conflict resolution
export function getLocalUpdatedAt(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.updatedAt) || '';
}

// Export state as JSON (for backup)
export function exportState(state: AppState): string {
  return JSON.stringify({
    ...state,
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
  }, null, 2);
}

// Import state from JSON
export function importState(jsonString: string): { success: boolean; state?: AppState; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON format' };
    }

    // Validate and normalize imported data
    const completedIds = Array.isArray(parsed.completedIds) 
      ? parsed.completedIds.filter((id: unknown) => typeof id === 'number' && TASK_ID_SET.has(id))
      : [];

    const completedDocIds = Array.isArray(parsed.completedDocIds)
      ? parsed.completedDocIds.filter((id: unknown) => typeof id === 'string' && DOC_ID_SET.has(id))
      : [];

    const taskMeta: Record<number, TaskMeta> = {};
    if (parsed.taskMeta && typeof parsed.taskMeta === 'object') {
      Object.entries(parsed.taskMeta).forEach(([key, value]) => {
        const taskId = Number(key);
        if (TASK_ID_SET.has(taskId) && value && typeof value === 'object') {
          const v = value as Record<string, unknown>;
          taskMeta[taskId] = {
            note: typeof v.note === 'string' ? v.note : '',
            status: ['default', 'blocked', 'in-progress', 'na'].includes(String(v.status || ''))
              ? (v.status as TaskMeta['status'])
              : 'default',
            completedAt: typeof v.completedAt === 'string' ? v.completedAt : undefined,
          };
        }
      });
    }

    const pinnedIds = Array.isArray(parsed.pinnedIds)
      ? parsed.pinnedIds.filter((id: unknown) => typeof id === 'number' && TASK_ID_SET.has(id))
      : [];

    const launchDate = typeof parsed.launchDate === 'string' && parsed.launchDate
      ? parsed.launchDate
      : DEFAULT_STATE.launchDate;

    const collapsedCategories = Array.isArray(parsed.collapsedCategories)
      ? parsed.collapsedCategories.filter((cat: unknown) => typeof cat === 'string')
      : [];

    const activityLog = Array.isArray(parsed.activityLog)
      ? parsed.activityLog.slice(0, 100)
      : [];

    const preferences = {
      ...DEFAULT_STATE.preferences,
      ...(parsed.preferences && typeof parsed.preferences === 'object' ? parsed.preferences : {}),
    };

    return {
      success: true,
      state: {
        completedIds,
        completedDocIds,
        taskMeta,
        docMeta: typeof parsed.docMeta === 'object' && parsed.docMeta ? parsed.docMeta : {},
        pinnedIds,
        launchDate,
        collapsedCategories,
        activityLog,
        undoStack: [],
        redoStack: [],
        preferences,
        fileRegistry: typeof parsed.fileRegistry === 'object' && parsed.fileRegistry ? parsed.fileRegistry : {},
      },
    };
  } catch (error) {
    return { success: false, error: 'Failed to parse JSON' };
  }
}

// Clear all state
export function clearState(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  localStorage.removeItem(`${STORAGE_PREFIX}activityLog`);
  localStorage.removeItem(`${STORAGE_PREFIX}preferences`);
  localStorage.removeItem(`${STORAGE_PREFIX}fileRegistry`);
}
