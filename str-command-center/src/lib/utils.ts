import { clsx, type ClassValue } from 'clsx';

// Utility for combining class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format date for display
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Format time for display
export function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

// Get color class based on percentage
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'text-emerald-400';
  if (percentage >= 75) return 'text-emerald-400';
  if (percentage >= 50) return 'text-amber-400';
  if (percentage >= 25) return 'text-orange-400';
  return 'text-slate-400';
}

// Get background color class based on percentage
export function getProgressBgColor(percentage: number): string {
  if (percentage >= 100) return 'bg-emerald-500';
  if (percentage >= 75) return 'bg-emerald-500';
  if (percentage >= 50) return 'bg-amber-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-slate-500';
}

// Timing badge colors
export function getTimingStyles(timing: string): string {
  switch (timing) {
    case 'Pre-Listing':
      return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    case 'Ongoing':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'Post-Listing':
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    default:
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
}

// Status badge colors
export function getStatusStyles(status: string): string {
  switch (status) {
    case 'blocked':
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'in-progress':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'na':
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    default:
      return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
  }
}

// Pluralize helper
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
