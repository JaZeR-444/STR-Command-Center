import { useEffect, useCallback } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface UseHotkeysOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Custom hook for keyboard shortcuts
 * @param keys - Key combination (e.g., "ctrl+k", "space", "p")
 * @param callback - Function to call when keys are pressed
 * @param options - Configuration options
 */
export function useHotkeys(
  keys: string | string[],
  callback: KeyHandler,
  options: UseHotkeysOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const keyArray = Array.isArray(keys) ? keys : [keys];
      const pressedKey = event.key.toLowerCase();
      
      for (const keyCombo of keyArray) {
        const parts = keyCombo.toLowerCase().split('+');
        const modifiers = parts.slice(0, -1);
        const mainKey = parts[parts.length - 1];

        // Check modifiers
        const ctrlMatch = modifiers.includes('ctrl') ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = modifiers.includes('shift') ? event.shiftKey : !event.shiftKey;
        const altMatch = modifiers.includes('alt') ? event.altKey : !event.altKey;

        // Check main key
        const keyMatch = pressedKey === mainKey || event.code.toLowerCase() === mainKey.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback(event);
          return;
        }
      }
    },
    [keys, callback, enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress, enabled]);
}

/**
 * Hook for handling arrow key navigation
 */
export function useArrowNavigation(
  onUp: () => void,
  onDown: () => void,
  options: UseHotkeysOptions = {}
) {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUp();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onDown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUp, onDown, enabled]);
}
