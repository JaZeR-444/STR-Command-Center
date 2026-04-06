// Task timing categories
export type TaskTiming = 'Pre-Listing' | 'Ongoing' | 'Post-Listing';

// Task status for notes/blocking
export type TaskStatus = 'default' | 'in-progress' | 'blocked' | 'na';

// Single roadmap task
export interface Task {
  id: number;
  section: string;
  category: string;
  task: string;
  timing: TaskTiming;
  description: string;
}

// Task metadata (notes, status, completion time)
export interface TaskMeta {
  note?: string;
  status?: TaskStatus;
  completedAt?: string;
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

// Application state stored in localStorage
export interface AppState {
  completedIds: number[];
  completedDocIds: string[];
  taskMeta: Record<number, TaskMeta>;
  pinnedIds: number[];
  launchDate: string;
  collapsedCategories: string[];
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

// Activity log entry
export interface ActivityLogEntry {
  type: 'complete' | 'uncomplete' | 'note' | 'doc_complete';
  label: string;
  section: string;
  timestamp: string;
}
