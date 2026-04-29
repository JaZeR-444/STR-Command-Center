'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SwipeableTaskProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;  // Complete action
  onSwipeRight?: () => void; // Pin action
  threshold?: number;
  className?: string;
}

export function SwipeableTask({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  threshold = 100,
  className 
}: SwipeableTaskProps) {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeAction, setSwipeAction] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    currentX.current = e.touches[0].clientX;
    const delta = currentX.current - startX.current;
    
    // Limit swipe distance
    const maxSwipe = 120;
    const limitedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, delta));
    
    setOffset(limitedDelta);
    
    // Determine action based on distance
    if (Math.abs(limitedDelta) > threshold) {
      setSwipeAction(limitedDelta < 0 ? 'left' : 'right');
    } else {
      setSwipeAction(null);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    
    if (Math.abs(offset) > threshold) {
      // Execute action
      if (offset < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (offset > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
    
    // Reset
    setOffset(0);
    setSwipeAction(null);
  };

  // Cancel swipe on touch cancel
  useEffect(() => {
    const handleTouchCancel = () => {
      setOffset(0);
      setIsSwiping(false);
      setSwipeAction(null);
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchcancel', handleTouchCancel as any);
      return () => element.removeEventListener('touchcancel', handleTouchCancel as any);
    }
  }, []);

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        {/* Right Swipe = Pin */}
        <div
          className={cn(
            'flex items-center gap-2 transition-opacity',
            offset > 50 ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12l-5-2.5L5 17V5z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-blue-400">Pin</span>
        </div>

        {/* Left Swipe = Complete */}
        <div
          className={cn(
            'flex items-center gap-2 transition-opacity',
            offset < -50 ? 'opacity-100' : 'opacity-0'
          )}
        >
          <span className="text-sm font-semibold text-emerald-400">Complete</span>
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Swipeable Content */}
      <div
        className={cn(
          'relative transition-transform touch-pan-y',
          isSwiping ? 'transition-none' : 'duration-300 ease-out',
          swipeAction === 'left' && 'bg-emerald-500/10',
          swipeAction === 'right' && 'bg-blue-500/10'
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
