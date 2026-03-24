import type { Vector2 } from '~/studio/_lib/types';

export function screenToCanvasPoint(
  clientX: number,
  clientY: number,
  viewportRect: DOMRect,
  pan: Vector2,
  zoom: number
): Vector2 {
  return {
    x: Math.round((clientX - viewportRect.left - pan.x) / zoom),
    y: Math.round((clientY - viewportRect.top - pan.y) / zoom),
  };
}

export function canvasRectFromScreenRect(
  rect: { left: number; top: number; width: number; height: number },
  viewportRect: DOMRect,
  pan: Vector2,
  zoom: number
) {
  const origin = screenToCanvasPoint(rect.left, rect.top, viewportRect, pan, zoom);
  return {
    x: origin.x,
    y: origin.y,
    width: Math.max(Math.round(rect.width / zoom), 1),
    height: Math.max(Math.round(rect.height / zoom), 1),
  };
}
