'use client';

import { CommandPalette } from './command-palette';
import { useCommandPalette } from '@/hooks/use-command-palette';

export function CommandPaletteWrapper() {
  const { isOpen, setIsOpen } = useCommandPalette();

  return <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
