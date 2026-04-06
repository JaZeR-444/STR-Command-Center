'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-bg-dark border border-border-dark rounded-lg px-4 py-2.5 text-sm text-slate-300',
          'placeholder:text-slate-600',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
          'transition-colors',
          className
        )}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full bg-bg-dark border border-border-dark rounded-lg px-4 py-2.5 text-sm text-slate-300',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
          'cursor-pointer',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full bg-bg-dark border border-border-dark rounded-lg px-4 py-3 text-sm text-slate-300',
          'placeholder:text-slate-600 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
          className
        )}
        {...props}
      />
    </div>
  );
}
