'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 max-h-[85vh] bg-zinc-950 border-t-2 border-zinc-800 rounded-t-3xl z-50 md:hidden',
          'animate-in slide-in-from-bottom duration-300'
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/70 px-6 py-4 z-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
}
