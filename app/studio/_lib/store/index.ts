import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { StudioStore } from '~/studio/_lib/types';
import { createDocumentSlice } from './slices/document-slice';
import { createSelectionSlice } from './slices/selection-slice';
import { createHistorySlice } from './slices/history-slice';
import { createViewportSlice } from './slices/viewport-slice';
import { createUISlice } from './slices/ui-slice';
import { createClipboardSlice } from './slices/clipboard-slice';

export const useStudioStore = create<StudioStore>()(
  immer((...args) => ({
    ...createDocumentSlice(...args),
    ...createSelectionSlice(...args),
    ...createHistorySlice(...args),
    ...createViewportSlice(...args),
    ...createUISlice(...args),
    ...createClipboardSlice(...args),
  }))
);
