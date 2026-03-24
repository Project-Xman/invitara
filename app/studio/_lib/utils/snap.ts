import { GRID_SIZE } from '~/studio/_lib/constants';

export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapPosition(x: number, y: number, enabled: boolean, gridSize: number = GRID_SIZE): { x: number; y: number } {
  if (!enabled) return { x: Math.round(x), y: Math.round(y) };
  return { x: snapToGrid(x, gridSize), y: snapToGrid(y, gridSize) };
}

export function snapSize(w: number, h: number, enabled: boolean, gridSize: number = GRID_SIZE): { width: number; height: number } {
  if (!enabled) return { width: Math.round(w), height: Math.round(h) };
  return { width: Math.max(gridSize, snapToGrid(w, gridSize)), height: Math.max(gridSize, snapToGrid(h, gridSize)) };
}
