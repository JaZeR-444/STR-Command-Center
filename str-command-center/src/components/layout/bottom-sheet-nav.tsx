'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  snapPoints?: number[]; // Heights in px where sheet can snap [min, mid, max]
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children,
  snapPoints = [200, 400, window.innerHeight * 0.9]
}: BottomSheetProps) {
  const [height, setHeight] = useState(snapPoints[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(height);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY;
    const newHeight = Math.max(snapPoints[0], Math.min(snapPoints[2], startHeight + deltaY));
    setHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Snap to nearest snap point
    const closest = snapPoints.reduce((prev, curr) => 
      Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev
    );
    
    // If dragged down below min snap point, close
    if (height < snapPoints[0] * 0.7) {
      onClose();
    } else {
      setHeight(closest);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHeight(snapPoints[1]); // Open to mid snap point
    }
  }, [isOpen, snapPoints]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 glass-heavy rounded-t-3xl border-t-2 border-zinc-700 shadow-strong z-50 transition-all lg:hidden',
          isDragging ? 'transition-none' : 'duration-300 ease-out'
        )}
        style={{ height: `${height}px` }}
      >
        {/* Drag Handle */}
        <div
          className="w-full py-4 flex justify-center cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-zinc-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-zinc-800/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4" style={{ height: `calc(100% - 100px)` }}>
          {children}
        </div>
      </div>
    </>
  );
}

interface SectionBottomSheetProps {
  sections: { name: string; shortName: string; percentage: number; blocked: number }[];
  selectedSection: string;
  onSelectSection: (section: string) => void;
}

export function SectionBottomSheet({ sections, selectedSection, onSelectSection }: SectionBottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full lg:hidden px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">
            {sections.find(s => s.name === selectedSection)?.shortName || 'Select Section'}
          </span>
          <span className="text-xs text-zinc-500">
            {sections.find(s => s.name === selectedSection)?.percentage || 0}% complete
          </span>
        </div>
        <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Section"
        snapPoints={[300, 500, window.innerHeight * 0.85]}
      >
        <div className="space-y-2">
          {sections.map((section, idx) => {
            const isActive = section.name === selectedSection;
            return (
              <button
                key={section.name}
                onClick={() => {
                  onSelectSection(section.name);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition-all text-left min-h-[60px]',
                  isActive
                    ? 'bg-blue-500/15 border-blue-500/40'
                    : 'bg-zinc-900/50 border-zinc-800 active:bg-zinc-800'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-2">
                    {section.blocked > 0 && (
                      <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center">
                        {section.blocked}
                      </span>
                    )}
                    <span className={cn(
                      'text-sm font-bold',
                      section.percentage >= 100 ? 'text-emerald-400' :
                      section.percentage >= 50 ? 'text-blue-400' :
                      'text-amber-400'
                    )}>
                      {section.percentage}%
                    </span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white mb-2">{section.shortName}</div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      section.percentage >= 100 ? 'bg-emerald-500' :
                      section.percentage >= 50 ? 'bg-blue-500' :
                      'bg-amber-500'
                    )}
                    style={{ width: `${section.percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
