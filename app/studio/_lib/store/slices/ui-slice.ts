import type { StateCreator } from 'zustand';
import type { StudioStore, UIState } from '~/studio/_lib/types';

export const createUISlice: StateCreator<
  StudioStore,
  [['zustand/immer', never]],
  [],
  Pick<StudioStore, 'leftPanel' | 'rightPanelOpen' | 'animationPanelOpen' | 'activeTool' | 'exportDialogOpen' | 'previewMode' | 'setLeftPanel' | 'toggleRightPanel' | 'toggleAnimationPanel' | 'setActiveTool' | 'setExportDialogOpen' | 'togglePreview'>
> = (set) => ({
  leftPanel: 'insert' as UIState['leftPanel'],
  rightPanelOpen: true,
  animationPanelOpen: false,
  activeTool: 'select' as UIState['activeTool'],
  exportDialogOpen: false,
  previewMode: false,

  setLeftPanel: (panel: UIState['leftPanel']) => {
    set((state) => {
      state.leftPanel = panel;
    });
  },

  toggleRightPanel: () => {
    set((state) => {
      state.rightPanelOpen = !state.rightPanelOpen;
    });
  },

  toggleAnimationPanel: () => {
    set((state) => {
      state.animationPanelOpen = !state.animationPanelOpen;
    });
  },

  setActiveTool: (tool: UIState['activeTool']) => {
    set((state) => {
      state.activeTool = tool;
    });
  },

  setExportDialogOpen: (open: boolean) => {
    set((state) => {
      state.exportDialogOpen = open;
    });
  },

  togglePreview: () => {
    set((state) => {
      state.previewMode = !state.previewMode;
    });
  },
});
