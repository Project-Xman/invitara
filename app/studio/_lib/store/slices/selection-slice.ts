import type { StateCreator } from 'zustand';
import type { StudioStore } from '~/studio/_lib/types';

export const createSelectionSlice: StateCreator<
  StudioStore,
  [['zustand/immer', never]],
  [],
  Pick<StudioStore, 'selectedIds' | 'hoveredId' | 'focusedId' | 'select' | 'clearSelection' | 'setHovered' | 'setFocused'>
> = (set) => ({
  selectedIds: [],
  hoveredId: null,
  focusedId: null,

  select: (ids: string[], append = false) => {
    set((state) => {
      if (append) {
        const existing = new Set(state.selectedIds);
        for (const id of ids) {
          if (existing.has(id)) {
            existing.delete(id);
          } else {
            existing.add(id);
          }
        }
        state.selectedIds = Array.from(existing);
      } else {
        state.selectedIds = ids;
      }
    });
  },

  clearSelection: () => {
    set((state) => {
      state.selectedIds = [];
      state.focusedId = null;
    });
  },

  setHovered: (id: string | null) => {
    set((state) => {
      state.hoveredId = id;
    });
  },

  setFocused: (id: string | null) => {
    set((state) => {
      state.focusedId = id;
    });
  },
});
