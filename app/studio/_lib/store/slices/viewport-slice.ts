import type { StateCreator } from 'zustand';
import type { StudioStore, DeviceMode, Vector2 } from '~/studio/_lib/types';
import { MIN_ZOOM, MAX_ZOOM } from '~/studio/_lib/constants';

export const createViewportSlice: StateCreator<
  StudioStore,
  [['zustand/immer', never]],
  [],
  Pick<StudioStore, 'zoom' | 'pan' | 'device' | 'showGrid' | 'breakpoints' | 'setZoom' | 'setPan' | 'setDevice' | 'toggleGrid' | 'addBreakpoint' | 'removeBreakpoint'>
> = (set) => ({
  zoom: 1,
  pan: { x: 0, y: 0 },
  device: 'desktop' as DeviceMode,
  showGrid: true,
  breakpoints: [
    { id: 'desktop', name: 'Desktop', width: 1440 },
    { id: 'tablet', name: 'Tablet', width: 768 },
    { id: 'mobile', name: 'Mobile', width: 375 },
  ],

  setZoom: (zoom: number) => {
    set((state) => {
      state.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
      state.documentDirty = true;
    });
  },

  setPan: (pan: Vector2) => {
    set((state) => {
      state.pan = pan;
      state.documentDirty = true;
    });
  },

  setDevice: (device: DeviceMode) => {
    set((state) => {
      state.device = device;
      state.documentDirty = true;
    });
  },

  toggleGrid: () => {
    set((state) => {
      state.showGrid = !state.showGrid;
      state.documentDirty = true;
    });
  },

  addBreakpoint: (name: string, width: number) => {
    const id = `bp-${Date.now()}`;
    set((state) => {
      state.breakpoints.push({ id, name, width });
      state.breakpoints.sort((a, b) => b.width - a.width);
      state.documentDirty = true;
    });
  },

  removeBreakpoint: (id: string) => {
    set((state) => {
      state.breakpoints = state.breakpoints.filter((bp) => bp.id !== id);
      state.documentDirty = true;
    });
  },
});
