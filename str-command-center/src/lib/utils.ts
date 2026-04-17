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
  if (percentage >= 100) return 'text-success-400';
  if (percentage >= 75) return 'text-success-400';
  if (percentage >= 50) return 'text-warm-400';
  if (percentage >= 25) return 'text-accent-400';
  return 'text-slate-300';
}

// Get background color class based on percentage
export function getProgressBgColor(percentage: number): string {
  if (percentage >= 100) return 'bg-success-400';
  if (percentage >= 75) return 'bg-success-400';
  if (percentage >= 50) return 'bg-warm-400';
  if (percentage >= 25) return 'bg-accent-400';
  return 'bg-slate-400';
}

// Timing badge colors - warmer, friendlier palette
export function getTimingStyles(timing: string): string {
  switch (timing) {
    case 'Pre-Listing':
      return 'bg-accent-500/15 text-accent-300 border-accent-400/30';
    case 'Ongoing':
      return 'bg-success-500/15 text-success-300 border-success-400/30';
    case 'Post-Listing':
      return 'bg-warm-500/15 text-warm-300 border-warm-400/30';
    default:
      return 'bg-slate-500/15 text-slate-300 border-slate-500/25';
  }
}

// Status badge colors - softer, more approachable
export function getStatusStyles(status: string): string {
  switch (status) {
    case 'blocked':
      return 'bg-red-400/15 text-red-300 border-red-400/30';
    case 'in-progress':
      return 'bg-warm-400/15 text-warm-200 border-warm-300/30';
    case 'na':
      return 'bg-slate-500/15 text-slate-300 border-slate-500/25';
    default:
      return 'bg-accent-500/15 text-accent-300 border-accent-400/30';
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
