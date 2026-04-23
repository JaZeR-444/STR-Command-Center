'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/lib/mobile-hooks';

export interface FABAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  mainIcon?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function FloatingActionButton({
  actions,
  mainIcon,
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const haptic = useHaptic();

  const handleToggle = () => {
    haptic.light();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: FABAction) => {
    haptic.medium();
    action.onClick();
    setIsOpen(false);
  };

  const positionClasses = {
    'bottom-right': 'bottom-24 right-6',
    'bottom-left': 'bottom-24 left-6',
    'bottom-center': 'bottom-24 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={cn('lg:hidden fixed z-40', positionClasses[position])}>
      {/* Action Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={handleToggle}
          />

          {/* Actions */}
          <div className="absolute bottom-20 right-0 space-y-3 mb-2">
            {actions.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg border border-zinc-800 whitespace-nowrap shadow-lg">
                  {action.label}
                </span>
                <button
                  onClick={() => handleAction(action)}
                  className={cn(
                    'w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-90',
                    action.color || 'bg-blue-500 text-white'
                  )}
                >
                  {action.icon}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Main FAB */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90',
          isOpen
            ? 'bg-zinc-800 text-white rotate-45'
            : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
        )}
      >
        {mainIcon || (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
        )}
      </button>
    </div>
  );
}
