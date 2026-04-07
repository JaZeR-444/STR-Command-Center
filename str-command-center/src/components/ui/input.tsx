'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.24em] mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full glass border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100',
          'placeholder:text-zinc-500',
          'focus:outline-none focus:ring-2 focus:ring-[rgba(138,180,255,0.35)] focus:border-[rgba(138,180,255,0.35)]',
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
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.24em] mb-2">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full glass border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100',
          'focus:outline-none focus:ring-2 focus:ring-[rgba(138,180,255,0.35)]',
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
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.24em] mb-2">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full glass border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100',
          'placeholder:text-zinc-500 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-[rgba(138,180,255,0.35)]',
          'transition-all duration-300',
          className
        )}
        {...props}
      />
    </div>
  );
}
