// Storage utilities for persisting state to localStorage
import type { AppState, TaskMeta } from '@/types';
import { roadmapData } from '@/data/roadmap';
import { documentationData } from '@/data/documents';
import {
  initialOperationsTasks,
  initialReservations,
  initialGuests,
  initialInboxThreads,
  initialDailyPricing,
  initialPricingRules,
  initialMaintenanceIssues,
  initialMarketCompetitors,
  initialLocalEvents,
  initialMarketMetrics,
  initialAutomationRules,
} from './initial-operations-data';

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
  activityLog: `${STORAGE_PREFIX}activityLog`,
  preferences: `${STORAGE_PREFIX}preferences`,
  fileRegistry: `${STORAGE_PREFIX}fileRegistry`,
  documentViewMode: `${STORAGE_PREFIX}documentViewMode`,
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
    theme: 'light',
    launchDateReminders: true,
    showVelocityChart: true,
    compactMode: false,
  },
  fileRegistry: {},
  // New operations data
  reservations: initialReservations,
  guests: initialGuests,
  operationsTasks: initialOperationsTasks,
  inboxThreads: initialInboxThreads,
  pricingRecommendations: [],
  dailyPricing: initialDailyPricing,
  pricingRules: initialPricingRules,
  maintenanceIssues: initialMaintenanceIssues,
  calendarEvents: [],
  propertyNotes: {},
  propertySettings: {},
  // Market intelligence
  marketCompetitors: initialMarketCompetitors,
  localEvents: initialLocalEvents,
  marketMetrics: initialMarketMetrics,
  // Automation
  automationRules: initialAutomationRules,
  automationLogs: [],
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

// Restore a raw task meta object into a validated TaskMeta — preserves ALL fields
function sanitizeTaskMeta(raw: Record<string, unknown>): TaskMeta {
  const validStatuses = ['default', 'blocked', 'in-progress', 'na'] as const;
  return {
    note: typeof raw.note === 'string' ? raw.note : '',
    status: validStatuses.includes(raw.status as typeof validStatuses[number])
      ? (raw.status as TaskMeta['status'])
      : 'default',
    completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : undefined,
    priority: raw.priority as TaskMeta['priority'] | undefined,
    estimatedMinutes: typeof raw.estimatedMinutes === 'number' ? raw.estimatedMinutes : undefined,
    owner: typeof raw.owner === 'string' ? raw.owner : undefined,
    // Preserve complex sub-objects — validated by TypeScript on assignment
    checklistItems: Array.isArray(raw.checklistItems) ? raw.checklistItems : undefined,
    linkedDocuments: Array.isArray(raw.linkedDocuments) ? raw.linkedDocuments : undefined,
    attachedFiles: Array.isArray(raw.attachedFiles) ? raw.attachedFiles : undefined,
    activityLog: Array.isArray(raw.activityLog) ? raw.activityLog : undefined,
    isVerifiedComplete: typeof raw.isVerifiedComplete === 'boolean' ? raw.isVerifiedComplete : undefined,
  };
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

    const rawMeta = safeJsonParse<Record<string, Record<string, unknown>>>(
      localStorage.getItem(STORAGE_KEYS.taskMeta),
      {}
    );

    // Normalize taskMeta - keep ALL fields for valid task IDs
    const taskMeta: Record<number, TaskMeta> = {};
    Object.entries(rawMeta).forEach(([key, value]) => {
      const taskId = Number(key);
      if (TASK_ID_SET.has(taskId) && value && typeof value === 'object') {
        taskMeta[taskId] = sanitizeTaskMeta(value);
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
      localStorage.getItem(STORAGE_KEYS.activityLog),
      []
    ).slice(0, 200); // Keep last 200 entries

    const preferences = {
      ...DEFAULT_STATE.preferences,
      ...safeJsonParse<import('@/types').UserPreferences>(
        localStorage.getItem(STORAGE_KEYS.preferences),
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
        localStorage.getItem(STORAGE_KEYS.fileRegistry),
        {}
      ),
      documentViewMode: (localStorage.getItem(STORAGE_KEYS.documentViewMode) as 'list' | 'grid') || 'list',
      // New operations data
      reservations: safeJsonParse(localStorage.getItem('str_cc_reservations'), []),
      guests: safeJsonParse(localStorage.getItem('str_cc_guests'), {}),
      operationsTasks: safeJsonParse(localStorage.getItem('str_cc_operations_tasks'), []),
      inboxThreads: safeJsonParse(localStorage.getItem('str_cc_inbox_threads'), []),
      pricingRecommendations: safeJsonParse(localStorage.getItem('str_cc_pricing_recommendations'), []),
      dailyPricing: safeJsonParse(localStorage.getItem('str_cc_daily_pricing'), []),
      pricingRules: safeJsonParse(localStorage.getItem('str_cc_pricing_rules'), []),
      maintenanceIssues: safeJsonParse(localStorage.getItem('str_cc_maintenance_issues'), []),
      calendarEvents: safeJsonParse(localStorage.getItem('str_cc_calendar_events'), []),
      propertyNotes: safeJsonParse(localStorage.getItem('str_cc_property_notes'), {}),
      propertySettings: safeJsonParse(localStorage.getItem('str_cc_property_settings'), {}),
      // Market intelligence
      marketCompetitors: safeJsonParse(localStorage.getItem('str_cc_market_competitors'), []),
      localEvents: safeJsonParse(localStorage.getItem('str_cc_local_events'), []),
      marketMetrics: safeJsonParse(localStorage.getItem('str_cc_market_metrics'), []),
      // Automation
      automationRules: safeJsonParse(localStorage.getItem('str_cc_automation_rules'), []),
      automationLogs: safeJsonParse(localStorage.getItem('str_cc_automation_logs'), []),
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
    localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify(state.activityLog.slice(0, 200)));
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(state.preferences));
    localStorage.setItem(STORAGE_KEYS.fileRegistry, JSON.stringify(state.fileRegistry || {}));
    // Save new operations data
    localStorage.setItem('str_cc_reservations', JSON.stringify(state.reservations || []));
    localStorage.setItem('str_cc_guests', JSON.stringify(state.guests || {}));
    localStorage.setItem('str_cc_operations_tasks', JSON.stringify(state.operationsTasks || []));
    localStorage.setItem('str_cc_inbox_threads', JSON.stringify(state.inboxThreads || []));
    localStorage.setItem('str_cc_pricing_recommendations', JSON.stringify(state.pricingRecommendations || []));
    localStorage.setItem('str_cc_daily_pricing', JSON.stringify(state.dailyPricing || []));
    localStorage.setItem('str_cc_pricing_rules', JSON.stringify(state.pricingRules || []));
    localStorage.setItem('str_cc_maintenance_issues', JSON.stringify(state.maintenanceIssues || []));
    localStorage.setItem('str_cc_calendar_events', JSON.stringify(state.calendarEvents || []));
    localStorage.setItem('str_cc_property_notes', JSON.stringify(state.propertyNotes || {}));
    localStorage.setItem('str_cc_property_settings', JSON.stringify(state.propertySettings || {}));
    // Save market intelligence
    localStorage.setItem('str_cc_market_competitors', JSON.stringify(state.marketCompetitors || []));
    localStorage.setItem('str_cc_local_events', JSON.stringify(state.localEvents || []));
    localStorage.setItem('str_cc_market_metrics', JSON.stringify(state.marketMetrics || []));
    // Save automation
    localStorage.setItem('str_cc_automation_rules', JSON.stringify(state.automationRules || []));
    localStorage.setItem('str_cc_automation_logs', JSON.stringify(state.automationLogs || []));
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
    version: '2.1.0',
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

    // Preserve ALL TaskMeta fields on import
    const taskMeta: Record<number, TaskMeta> = {};
    if (parsed.taskMeta && typeof parsed.taskMeta === 'object') {
      Object.entries(parsed.taskMeta).forEach(([key, value]) => {
        const taskId = Number(key);
        if (TASK_ID_SET.has(taskId) && value && typeof value === 'object') {
          taskMeta[taskId] = sanitizeTaskMeta(value as Record<string, unknown>);
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
      ? parsed.activityLog.slice(0, 200)
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
        documentViewMode: (localStorage.getItem(STORAGE_KEYS.documentViewMode) as 'list' | 'grid') || 'list',
        reservations: [],
        guests: {},
        operationsTasks: [],
        inboxThreads: [],
        pricingRecommendations: [],
        dailyPricing: [],
        pricingRules: [],
        maintenanceIssues: [],
        calendarEvents: [],
        propertyNotes: {},
        propertySettings: {},
        // Market intelligence
        marketCompetitors: [],
        localEvents: [],
        marketMetrics: [],
        // Automation
        automationRules: [],
        automationLogs: [],
      },
    };
  } catch {
    return { success: false, error: 'Failed to parse JSON' };
  }
}

// Clear all state — clears every key under the storage prefix
export function clearState(): void {
  if (typeof window === 'undefined') return;

  // Remove all known keys
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });

  // Belt-and-suspenders: scan for any remaining prefixed keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
