import type { Task } from '@/types';
import rawData from './roadmap-raw.json';

// Type assertion - data matches our Task interface
export const roadmapData: Task[] = rawData as Task[];

// Derived data structures
export const sections = [...new Set(roadmapData.map(t => t.section))].sort((a, b) => {
  const numA = parseInt(a.match(/^\d+/)?.[0] || '99');
  const numB = parseInt(b.match(/^\d+/)?.[0] || '99');
  return numA - numB;
});

export const categories = [...new Set(roadmapData.map(t => t.category))];

export const taskById = new Map(roadmapData.map(t => [t.id, t]));

export const tasksBySection = roadmapData.reduce((acc, task) => {
  if (!acc[task.section]) acc[task.section] = [];
  acc[task.section].push(task);
  return acc;
}, {} as Record<string, Task[]>);

export const tasksByCategory = roadmapData.reduce((acc, task) => {
  const key = `${task.section}::${task.category}`;
  if (!acc[key]) acc[key] = [];
  acc[key].push(task);
  return acc;
}, {} as Record<string, Task[]>);

// Helper to get short section name (without "Master Checklist")
export function getShortSectionName(section: string): string {
  return section.replace(/ Master Checklist$/, '').replace(/^\d+\s*/, '');
}

// Helper to get section number
export function getSectionNumber(section: string): string {
  return section.match(/^\d+/)?.[0] || '';
}

// Get all tasks for a given timing
export function getTasksByTiming(timing: 'Pre-Listing' | 'Ongoing' | 'Post-Listing'): Task[] {
  return roadmapData.filter(t => t.timing === timing);
}

// Pre-listing tasks are critical for launch readiness
export const preListingTasks = roadmapData.filter(t => t.timing === 'Pre-Listing');
export const ongoingTasks = roadmapData.filter(t => t.timing === 'Ongoing');
export const postListingTasks = roadmapData.filter(t => t.timing === 'Post-Listing');
