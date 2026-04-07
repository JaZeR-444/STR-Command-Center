// Task timing categories
export type TaskTiming = 'Pre-Listing' | 'Ongoing' | 'Post-Listing';

// Task status for notes/blocking
export type TaskStatus = 'default' | 'in-progress' | 'blocked' | 'na';

// Task priority levels
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// Single roadmap task
export interface Task {
  id: number;
  section: string;
  category: string;
  task: string;
  timing: TaskTiming;
  description: string;
  // Extended metadata (optional - not in raw data)
  estimatedMinutes?: number;
  priority?: TaskPriority;
  owner?: string;
  dependencies?: number[]; // Task IDs this depends on
}

// Task metadata (notes, status, completion time)
export interface TaskMeta {
  note?: string;
  status?: TaskStatus;
  completedAt?: string;
  priority?: TaskPriority;
  estimatedMinutes?: number;
  owner?: string;
}

export type DocumentStatus = 'missing' | 'in_review' | 'verified' | 'expired';

export interface AuditLogEntry {
  id: string;
  action: string;
  timestamp: string;
  actor: string;
}

export interface SmartTag {
  key: string;
  value: string;
}

// Document metadata (notes, file attachment reference)
export interface DocMeta {
  note?: string;
  completedAt?: string;
  status?: DocumentStatus;
  smartTags?: SmartTag[];
  auditLog?: AuditLogEntry[];
  attachments?: {
    id: string;
    name: string;
    size: number;
    type: string;
    attachedAt: string;
  }[];
}

// Document/artifact types
export type DocumentType = 
  | 'Strategy Doc' 
  | 'Tracker' 
  | 'Checklist' 
  | 'Spreadsheet' 
  | 'Guide' 
  | 'Log' 
  | 'List' 
  | 'Document' 
  | 'Asset' 
  | 'Procedure Guide' 
  | 'Timeline' 
  | 'Flowchart'
  | 'Inventory Tracker'
  | 'Research Report';

// Single documentation artifact
export interface DocumentArtifact {
  id: string;
  section: string;
  timing: TaskTiming;
  type: DocumentType | string;
  artifact: string;
  description: string;
}

// Document vault entry (file on disk)
export interface VaultEntry {
  path: string;
  name: string;
  location: 'completed' | 'legacy';
  score: number;
}

// User preferences
export interface UserPreferences {
  autoCollapseCompleted: boolean;
  lockedCategories: string[]; // Categories that won't auto-collapse
  searchHistory: string[];
  expandAllBySection: Record<string, boolean>; // Remember expand all per section
}

// Activity log entry for tracking changes
export interface ActivityEntry {
  id: string;
  type: 'task_complete' | 'task_uncomplete' | 'task_note' | 'task_status' | 'doc_complete' | 'doc_uncomplete';
  taskId?: number;
  docId?: string;
  label: string;
  section: string;
  timestamp: string;
  previousValue?: any;
  newValue?: any;
}

// Undo/redo stack entry
export interface UndoEntry {
  id: string;
  timestamp: string;
  action: string;
  previousState: Partial<AppState>;
  newState: Partial<AppState>;
}

// Application state stored in localStorage
export interface AppState {
  completedIds: number[];
  completedDocIds: string[];
  taskMeta: Record<number, TaskMeta>;
  docMeta: Record<string, DocMeta>;
  pinnedIds: number[];
  launchDate: string;
  collapsedCategories: string[];
  documentViewMode?: 'list' | 'grid';
  // New fields
  activityLog: ActivityEntry[];
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
  preferences: UserPreferences;
}

// Filter state (not persisted)
export interface FilterState {
  timing: 'All' | TaskTiming;
  completion: 'all' | 'incomplete' | 'complete';
  search: string;
  section: string | null;
}

// Section summary for dashboard
export interface SectionSummary {
  name: string;
  shortName: string;
  total: number;
  completed: number;
  percentage: number;
  preListingTotal: number;
  preListingCompleted: number;
  blockedCount: number;
  inProgressCount: number;
}

// Legacy activity log entry (for dashboard backward compat)
export interface ActivityLogEntry {
  type: 'complete' | 'uncomplete' | 'note' | 'doc_complete';
  label: string;
  section: string;
  timestamp: string;
}

// Search scope for enhanced search
export type SearchScope = 'all' | 'tasks' | 'descriptions' | 'notes';
