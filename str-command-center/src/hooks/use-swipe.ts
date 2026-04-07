import { useState } from 'react';

export function useSwipe(options: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}) {
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null);
  
  const threshold = options.threshold || 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = Math.abs(touchStart.y - touchEnd.y);
    
    // Prevent triggering if pulling mostly vertically (scrolling behavior)
    if (distanceY > 40) {
      setTouchStart(null);
      setTouchEnd(null);
      return; 
    }

    if (distanceX > threshold && options.onSwipeLeft) {
      options.onSwipeLeft();
    }
    if (distanceX < -threshold && options.onSwipeRight) {
      options.onSwipeRight();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}
