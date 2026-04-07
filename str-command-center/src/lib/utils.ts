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
  if (percentage >= 100) return 'text-emerald-300';
  if (percentage >= 75) return 'text-emerald-300';
  if (percentage >= 50) return 'text-amber-300';
  if (percentage >= 25) return 'text-[#a8c7f5]';
  return 'text-slate-300';
}

// Get background color class based on percentage
export function getProgressBgColor(percentage: number): string {
  if (percentage >= 100) return 'bg-emerald-400';
  if (percentage >= 75) return 'bg-emerald-400';
  if (percentage >= 50) return 'bg-amber-300';
  if (percentage >= 25) return 'bg-[#8ab4ff]';
  return 'bg-slate-400';
}

// Timing badge colors
export function getTimingStyles(timing: string): string {
  switch (timing) {
    case 'Pre-Listing':
      return 'bg-[#8ab4ff]/10 text-[#bdd5ff] border-[#8ab4ff]/25';
    case 'Ongoing':
      return 'bg-emerald-400/10 text-emerald-200 border-emerald-300/20';
    case 'Post-Listing':
      return 'bg-[#d9b36c]/10 text-[#f1d39a] border-[#d9b36c]/25';
    default:
      return 'bg-slate-500/15 text-slate-300 border-slate-500/20';
  }
}

// Status badge colors
export function getStatusStyles(status: string): string {
  switch (status) {
    case 'blocked':
      return 'bg-red-400/10 text-red-200 border-red-300/20';
    case 'in-progress':
      return 'bg-amber-300/10 text-amber-100 border-amber-200/20';
    case 'na':
      return 'bg-slate-500/15 text-slate-300 border-slate-500/20';
    default:
      return 'bg-[#8ab4ff]/10 text-[#bdd5ff] border-[#8ab4ff]/25';
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
