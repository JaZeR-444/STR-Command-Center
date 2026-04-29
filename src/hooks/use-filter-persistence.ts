import { useState, useEffect, useCallback } from 'react';

interface FilterState {
  timing?: string;
  completion?: string;
  search?: string;
  status?: string;
  section?: string;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
  icon?: string;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'launch-critical',
    name: 'Urgent Items',
    filters: { timing: 'Pre-Listing', completion: 'incomplete' },
    icon: '🚀',
  },
  {
    id: 'blocked',
    name: 'Blocked Tasks',
    filters: { status: 'blocked', completion: 'incomplete' },
    icon: '⚠️',
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    filters: { status: 'in-progress', completion: 'incomplete' },
    icon: '🔄',
  },
  {
    id: 'quick-wins',
    name: 'Quick Wins',
    filters: { completion: 'incomplete' },
    icon: '⚡',
  },
];

export function useFilterPersistence(pageKey: string) {
  const [filters, setFilters] = useState<FilterState>({});
  const [presets, setPresets] = useState<FilterPreset[]>(DEFAULT_PRESETS);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Load filters from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`filter_${pageKey}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFilters(parsed.filters || {});
        setActivePreset(parsed.activePreset || null);
      } catch (e) {
        console.error('Failed to parse stored filters:', e);
      }
    }

    // Load custom presets
    const storedPresets = localStorage.getItem('filter_presets');
    if (storedPresets) {
      try {
        const customPresets = JSON.parse(storedPresets);
        setPresets([...DEFAULT_PRESETS, ...customPresets]);
      } catch (e) {
        console.error('Failed to parse stored presets:', e);
      }
    }
  }, [pageKey]);

  // Persist filters to localStorage
  const updateFilters = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      localStorage.setItem(
        `filter_${pageKey}`,
        JSON.stringify({ filters: newFilters, activePreset: null })
      );
      setActivePreset(null);
    },
    [pageKey]
  );

  // Apply a preset
  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (preset) {
        setFilters(preset.filters);
        setActivePreset(presetId);
        localStorage.setItem(
          `filter_${pageKey}`,
          JSON.stringify({ filters: preset.filters, activePreset: presetId })
        );
      }
    },
    [presets, pageKey]
  );

  // Save current filters as a new preset
  const saveAsPreset = useCallback(
    (name: string, icon?: string) => {
      const newPreset: FilterPreset = {
        id: `custom_${Date.now()}`,
        name,
        filters,
        icon: icon || '📌',
      };

      const customPresets = presets.filter((p) => !DEFAULT_PRESETS.find((d) => d.id === p.id));
      const updatedCustom = [...customPresets, newPreset];

      setPresets([...DEFAULT_PRESETS, ...updatedCustom]);
      localStorage.setItem('filter_presets', JSON.stringify(updatedCustom));

      return newPreset.id;
    },
    [filters, presets]
  );

  // Delete a custom preset
  const deletePreset = useCallback(
    (presetId: string) => {
      // Can't delete default presets
      if (DEFAULT_PRESETS.find((p) => p.id === presetId)) return;

      const customPresets = presets.filter(
        (p) => !DEFAULT_PRESETS.find((d) => d.id === p.id) && p.id !== presetId
      );

      setPresets([...DEFAULT_PRESETS, ...customPresets]);
      localStorage.setItem('filter_presets', JSON.stringify(customPresets));

      if (activePreset === presetId) {
        setActivePreset(null);
      }
    },
    [presets, activePreset]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setActivePreset(null);
    localStorage.removeItem(`filter_${pageKey}`);
  }, [pageKey]);

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some((v) => v);

  return {
    filters,
    updateFilters,
    presets,
    activePreset,
    applyPreset,
    saveAsPreset,
    deletePreset,
    clearFilters,
    hasActiveFilters,
  };
}

// Hook for recent items (recently viewed tasks/docs)
export function useRecentItems<T extends { id: string | number }>(
  storageKey: string,
  maxItems: number = 10
) {
  const [recentItems, setRecentItems] = useState<T[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setRecentItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent items:', e);
      }
    }
  }, [storageKey]);

  const addRecentItem = useCallback(
    (item: T) => {
      setRecentItems((prev) => {
        // Remove duplicate if exists
        const filtered = prev.filter((i) => i.id !== item.id);
        // Add to front, limit to maxItems
        const updated = [item, ...filtered].slice(0, maxItems);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    },
    [storageKey, maxItems]
  );

  const clearRecent = useCallback(() => {
    setRecentItems([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    recentItems,
    addRecentItem,
    clearRecent,
  };
}
