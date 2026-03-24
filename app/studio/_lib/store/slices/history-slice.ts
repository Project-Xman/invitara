import type { StateCreator } from 'zustand';
import type { StudioStore } from '~/studio/_lib/types';
import { HISTORY_MAX_SIZE } from '~/studio/_lib/constants';
import { toStudioDocument } from '~/studio/_lib/utils/document';

export const createHistorySlice: StateCreator<
  StudioStore,
  [['zustand/immer', never]],
  [],
  Pick<StudioStore, 'past' | 'future' | 'maxSize' | 'pushHistory' | 'undo' | 'redo'>
> = (set, get) => ({
  past: [],
  future: [],
  maxSize: HISTORY_MAX_SIZE,

  pushHistory: () => {
    const snapshot = toStudioDocument(get());
    set((state) => {
      state.past.push({ document: snapshot });
      if (state.past.length > state.maxSize) {
        state.past.shift();
      }
      state.future = [];
    });
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0) return;

    const current = toStudioDocument(get());
    const previous = past[past.length - 1];
    if (!previous) return;
    set((state) => {
      state.past.pop();
      state.future.push({ document: current });
    });
    get().hydrateDocument(previous.document);
    get().markDocumentDirty();
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;

    const current = toStudioDocument(get());
    const next = future[future.length - 1];
    if (!next) return;
    set((state) => {
      state.future.pop();
      state.past.push({ document: current });
    });
    get().hydrateDocument(next.document);
    get().markDocumentDirty();
  },
});
