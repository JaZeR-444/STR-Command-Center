'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full glass border-white/[0.15] rounded-xl px-4 py-3 text-base text-white',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-accent-400/50 focus:border-accent-400/50',
          'transition-all duration-300',
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
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full glass border-white/[0.15] rounded-xl px-4 py-3 text-base text-white',
          'focus:outline-none focus:ring-2 focus:ring-accent-400/50',
          'cursor-pointer transition-all duration-300',
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
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full glass border-white/[0.15] rounded-xl px-4 py-3 text-base text-white',
          'placeholder:text-slate-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-accent-400/50',
          'transition-all duration-300',
          className
        )}
        {...props}
      />
    </div>
  );
}
