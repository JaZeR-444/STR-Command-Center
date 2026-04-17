/**
 * Task Dependency Parser & Topological Sorter
 * 
 * Parses task notes for dependency patterns and builds a dependency graph.
 * Performs topological sort to determine optimal task order.
 */

import type { Task } from '@/types';

export interface TaskDependency {
  taskId: number;
  dependsOn: number[];
  unblocksCount: number;
  isBlocked: boolean;
  blockedBy: number[];
}

export interface DependencyGraph {
  dependencies: Map<number, TaskDependency>;
  roots: number[]; // Tasks with no dependencies
  leaves: number[]; // Tasks that unblock nothing
}

/**
 * Patterns to detect dependencies in task notes/descriptions
 */
const DEPENDENCY_PATTERNS = [
  /(?:depends on|requires|blocked by|wait for|needs):\s*(?:task\s*)?#?(\d+)/gi,
  /(?:after|once)\s+(?:task\s*)?#?(\d+)/gi,
  /(?:must complete|finish)\s+(?:task\s*)?#?(\d+)\s+(?:first|before)/gi,
];

/**
 * Parse task content to extract dependency task IDs
 */
function parseDependencies(task: Task, taskNote?: string): number[] {
  const deps = new Set<number>();
  const content = `${task.task} ${task.description || ''} ${taskNote || ''}`;
  
  for (const pattern of DEPENDENCY_PATTERNS) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const depId = parseInt(match[1]);
      if (!isNaN(depId) && depId !== task.id) {
        deps.add(depId);
      }
    }
  }
  
  return Array.from(deps);
}

/**
 * Build dependency graph from tasks
 */
export function buildDependencyGraph(
  tasks: Task[],
  completedIds: Set<number>,
  taskMeta: Record<number, { note?: string }>
): DependencyGraph {
  const dependencies = new Map<number, TaskDependency>();
  const taskIdMap = new Map(tasks.map(t => [t.id, t]));
  
  // Initialize dependencies
  for (const task of tasks) {
    const taskNote = taskMeta[task.id]?.note;
    const deps = parseDependencies(task, taskNote);
    const validDeps = deps.filter(id => taskIdMap.has(id));
    
    dependencies.set(task.id, {
      taskId: task.id,
      dependsOn: validDeps,
      unblocksCount: 0,
      isBlocked: validDeps.some(depId => !completedIds.has(depId)),
      blockedBy: validDeps.filter(depId => !completedIds.has(depId)),
    });
  }
  
  // Count how many tasks each task unblocks
  for (const [taskId, dep] of dependencies) {
    for (const depId of dep.dependsOn) {
      const depNode = dependencies.get(depId);
      if (depNode) {
        depNode.unblocksCount++;
      }
    }
  }
  
  // Find roots (no dependencies) and leaves (unblocks nothing)
  const roots: number[] = [];
  const leaves: number[] = [];
  
  for (const [taskId, dep] of dependencies) {
    if (dep.dependsOn.length === 0) {
      roots.push(taskId);
    }
    if (dep.unblocksCount === 0) {
      leaves.push(taskId);
    }
  }
  
  return { dependencies, roots, leaves };
}

/**
 * Topological sort using Kahn's algorithm
 * Returns tasks in dependency-safe order
 */
export function topologicalSort(
  tasks: Task[],
  graph: DependencyGraph,
  completedIds: Set<number>
): Task[] {
  const sorted: Task[] = [];
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const inDegree = new Map<number, number>();
  
  // Calculate in-degree (number of incomplete dependencies)
  for (const [taskId, dep] of graph.dependencies) {
    inDegree.set(taskId, dep.blockedBy.length);
  }
  
  // Queue starts with tasks that have no incomplete dependencies
  const queue: number[] = [];
  for (const [taskId, degree] of inDegree) {
    if (degree === 0 && !completedIds.has(taskId)) {
      queue.push(taskId);
    }
  }
  
  // Process queue
  while (queue.length > 0) {
    // Sort queue by priority (high-leverage tasks first)
    queue.sort((a, b) => {
      const depA = graph.dependencies.get(a)!;
      const depB = graph.dependencies.get(b)!;
      return depB.unblocksCount - depA.unblocksCount;
    });
    
    const taskId = queue.shift()!;
    const task = taskMap.get(taskId);
    if (task) {
      sorted.push(task);
    }
    
    // Decrease in-degree for dependent tasks
    for (const [depTaskId, dep] of graph.dependencies) {
      if (dep.dependsOn.includes(taskId)) {
        const currentDegree = inDegree.get(depTaskId)!;
        inDegree.set(depTaskId, currentDegree - 1);
        
        if (currentDegree - 1 === 0 && !completedIds.has(depTaskId)) {
          queue.push(depTaskId);
        }
      }
    }
  }
  
  // Add remaining incomplete tasks (those not in dependency graph)
  for (const task of tasks) {
    if (!completedIds.has(task.id) && !sorted.find(t => t.id === task.id)) {
      sorted.push(task);
    }
  }
  
  return sorted;
}

/**
 * Get high-leverage tasks (completing them unblocks many others)
 */
export function getHighLeverageTasks(
  graph: DependencyGraph,
  completedIds: Set<number>,
  limit = 5
): number[] {
  const available = Array.from(graph.dependencies.entries())
    .filter(([id, dep]) => !completedIds.has(id) && !dep.isBlocked)
    .sort(([, a], [, b]) => b.unblocksCount - a.unblocksCount)
    .slice(0, limit)
    .map(([id]) => id);
  
  return available;
}

/**
 * Get tasks that are currently available (no blocking dependencies)
 */
export function getAvailableTasks(
  tasks: Task[],
  graph: DependencyGraph,
  completedIds: Set<number>
): Task[] {
  return tasks.filter(task => {
    const dep = graph.dependencies.get(task.id);
    return dep && !dep.isBlocked && !completedIds.has(task.id);
  });
}

/**
 * Get tasks that are blocked by dependencies
 */
export function getBlockedByDependencies(
  tasks: Task[],
  graph: DependencyGraph,
  completedIds: Set<number>
): Task[] {
  return tasks.filter(task => {
    const dep = graph.dependencies.get(task.id);
    return dep && dep.isBlocked && !completedIds.has(task.id);
  });
}
