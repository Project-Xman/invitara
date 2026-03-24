import type { DeviceMode, LayoutProps, StyleProps, TransformProps } from './types';

export const DEVICE_SIZES: Record<DeviceMode, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
};

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 0.1;

export const DEFAULT_LAYOUT: LayoutProps = {
  mode: 'stack',
  direction: 'vertical',
  gap: 0,
  padding: [0, 0, 0, 0],
  alignItems: 'start',
  justifyContent: 'start',
};

export const DEFAULT_STYLE: StyleProps = {
  borderRadius: [0, 0, 0, 0],
  borderWidth: 0,
  borderColor: '#e5e7eb',
  borderStyle: 'none',
  boxShadow: '',
  opacity: 1,
  overflow: 'visible',
};

export const DEFAULT_TRANSFORM: TransformProps = {
  position: { x: 0, y: 0 },
  size: { width: 'auto', height: 'auto' },
  rotation: 0,
  scale: { x: 1, y: 1 },
};

export const HISTORY_MAX_SIZE = 50;

export const GRID_SIZE = 20;
