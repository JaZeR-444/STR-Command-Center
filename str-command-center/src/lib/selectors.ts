// Selectors and computed values from state
import type { AppState, SectionSummary, Task, TaskStatus } from '@/types';
import { roadmapData, sections, tasksBySection, getShortSectionName, getSectionNumber } from '@/data/roadmap';
import { documentationData, documentsBySection, documentSections } from '@/data/documents';

// Get overall completion stats
export function getOverallStats(state: AppState) {
  const total = roadmapData.length;
  const completed = state.completedIds.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { total, completed, percentage };
}

// Get pre-listing readiness (critical for launch)
export function getPreListingStats(state: AppState) {
  const preListingTasks = roadmapData.filter(t => t.timing === 'Pre-Listing');
  const total = preListingTasks.length;
  const completed = preListingTasks.filter(t => state.completedIds.includes(t.id)).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;
  
  return { total, completed, percentage, remaining };
}

// Get documentation stats
export function getDocumentationStats(state: AppState) {
  const total = documentationData.length;
  const completed = state.completedDocIds.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { total, completed, percentage };
}

// Get section summaries for dashboard
export function getSectionSummaries(state: AppState): SectionSummary[] {
  return sections.map(section => {
    const tasks = tasksBySection[section] || [];
    const total = tasks.length;
    const completed = tasks.filter(t => state.completedIds.includes(t.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const preListingTasks = tasks.filter(t => t.timing === 'Pre-Listing');
    const preListingCompleted = preListingTasks.filter(t => state.completedIds.includes(t.id)).length;
    
    const blockedCount = tasks.filter(t => state.taskMeta[t.id]?.status === 'blocked').length;
    const inProgressCount = tasks.filter(t => state.taskMeta[t.id]?.status === 'in-progress').length;
    
    return {
      name: section,
      shortName: getShortSectionName(section),
      total,
      completed,
      percentage,
      preListingTotal: preListingTasks.length,
      preListingCompleted,
      blockedCount,
      inProgressCount,
    };
  });
}

// Get document section summaries
export function getDocSectionSummaries(state: AppState) {
  return documentSections.map(section => {
    const docs = documentsBySection[section] || [];
    const total = docs.length;
    const completed = docs.filter(d => state.completedDocIds.includes(d.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      name: section,
      total,
      completed,
      percentage,
    };
  });
}

// Get blocked tasks (for focus view)
export function getBlockedTasks(state: AppState): Task[] {
  return roadmapData.filter(t => 
    state.taskMeta[t.id]?.status === 'blocked' && 
    !state.completedIds.includes(t.id)
  );
}

// Get in-progress tasks (for focus view)
export function getInProgressTasks(state: AppState): Task[] {
  return roadmapData.filter(t => 
    state.taskMeta[t.id]?.status === 'in-progress' && 
    !state.completedIds.includes(t.id)
  );
}

// Get incomplete pre-listing tasks (critical for launch)
export function getIncompletePreListingTasks(state: AppState): Task[] {
  return roadmapData.filter(t => 
    t.timing === 'Pre-Listing' && 
    !state.completedIds.includes(t.id)
  );
}

// Get recently completed tasks (for dashboard)
export function getRecentlyCompleted(state: AppState, limit: number = 5): Task[] {
  const tasksWithMeta = state.completedIds
    .map(id => ({
      task: roadmapData.find(t => t.id === id),
      completedAt: state.taskMeta[id]?.completedAt,
    }))
    .filter((item): item is { task: Task; completedAt: string | undefined } => item.task !== undefined);
  
  // Sort by completion time (most recent first)
  tasksWithMeta.sort((a, b) => {
    if (!a.completedAt && !b.completedAt) return 0;
    if (!a.completedAt) return 1;
    if (!b.completedAt) return -1;
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  });
  
  return tasksWithMeta.slice(0, limit).map(item => item.task);
}

// Get pinned tasks
export function getPinnedTasks(state: AppState): Task[] {
  return state.pinnedIds
    .map(id => roadmapData.find(t => t.id === id))
    .filter((t): t is Task => t !== undefined);
}

// Get task status
export function getTaskStatus(state: AppState, taskId: number): TaskStatus {
  return state.taskMeta[taskId]?.status || 'default';
}

// Check if task is completed
export function isTaskCompleted(state: AppState, taskId: number): boolean {
  return state.completedIds.includes(taskId);
}

// Check if document is completed
export function isDocCompleted(state: AppState, docId: string): boolean {
  return state.completedDocIds.includes(docId);
}

// Days until launch
export function getDaysUntilLaunch(launchDate: string): number {
  const launch = new Date(launchDate);
  const now = new Date();
  const diff = launch.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Get critical path tasks (highest priority incomplete tasks)
export function getCriticalPathTasks(state: AppState, limit: number = 3): Task[] {
  // Priority: blocked > in-progress > pre-listing incomplete
  const blocked = getBlockedTasks(state);
  const inProgress = getInProgressTasks(state);
  const preListingIncomplete = getIncompletePreListingTasks(state);
  
  const critical: Task[] = [];
  
  // Add blocked first
  critical.push(...blocked.slice(0, limit));
  
  // Fill with in-progress if space
  if (critical.length < limit) {
    critical.push(...inProgress.slice(0, limit - critical.length));
  }
  
  // Fill with pre-listing if still space
  if (critical.length < limit) {
    critical.push(...preListingIncomplete.slice(0, limit - critical.length));
  }
  
  return critical.slice(0, limit);
}

// Filter tasks by criteria
export function filterTasks(
  tasks: Task[],
  filters: {
    timing?: 'All' | 'Pre-Listing' | 'Ongoing' | 'Post-Listing';
    completion?: 'all' | 'incomplete' | 'complete';
    search?: string;
  },
  state: AppState
): Task[] {
  let filtered = [...tasks];
  
  // Filter by timing
  if (filters.timing && filters.timing !== 'All') {
    filtered = filtered.filter(t => t.timing === filters.timing);
  }
  
  // Filter by completion
  if (filters.completion === 'complete') {
    filtered = filtered.filter(t => state.completedIds.includes(t.id));
  } else if (filters.completion === 'incomplete') {
    filtered = filtered.filter(t => !state.completedIds.includes(t.id));
  }
  
  // Filter by search term
  if (filters.search && filters.search.trim()) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(t => 
      t.task.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term)
    );
  }
  
  return filtered;
}

// Group tasks by category
export function groupTasksByCategory(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
}
