'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSwipe } from '@/lib/mobile-hooks';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[]; // Snap positions as percentages (e.g., [40, 80, 100])
  defaultSnap?: number; // Index of default snap point
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [80],
  defaultSnap = 0,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const sheetRef = useRef<HTMLDivElement>(null);

  const swipeHandlers = useSwipe({
    onSwipeDown: () => {
      if (currentSnap < snapPoints.length - 1) {
        setCurrentSnap(currentSnap + 1);
      } else {
        onClose();
      }
    },
    onSwipeUp: () => {
      if (currentSnap > 0) {
        setCurrentSnap(currentSnap - 1);
      }
    },
    threshold: 30,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentSnap(defaultSnap);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultSnap]);

  if (!isOpen) return null;

  const snapHeight = snapPoints[currentSnap];

  return (
    <>
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="lg:hidden fixed left-0 right-0 bottom-0 z-50 bg-zinc-950 rounded-t-3xl shadow-2xl border-t-2 border-zinc-800 transition-all duration-300 ease-out"
        style={{ height: `${snapHeight}vh` }}
      >
        {/* Drag Handle */}
        <div
          className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing"
          {...swipeHandlers}
        >
          <div className="w-12 h-1.5 bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-6 pb-4 flex items-center justify-between border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-full pb-24 px-6 pt-4">
          {children}
        </div>

        {/* Snap Indicator */}
        {snapPoints.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {snapPoints.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSnap(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentSnap
                    ? 'bg-blue-400 w-4'
                    : 'bg-zinc-700'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
