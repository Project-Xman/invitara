'use client';

import { useCallback, useRef, useState } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { UIState } from '~/studio/_lib/types';
import { canvasRectFromScreenRect } from '~/studio/_lib/utils/coordinates';

interface DrawRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const DRAW_TOOLS: UIState['activeTool'][] = ['frame', 'text', 'rectangle', 'ellipse', 'line'];

export function FrameDrawTool() {
  const activeTool = useStudioStore((s) => s.activeTool);
  const addNode = useStudioStore((s) => s.addNode);
  const updateNodeTransform = useStudioStore((s) => s.updateNodeTransform);
  const updateVectorProps = useStudioStore((s) => s.updateVectorProps);
  const select = useStudioStore((s) => s.select);
  const setActiveTool = useStudioStore((s) => s.setActiveTool);
  const zoom = useStudioStore((s) => s.zoom);
  const pan = useStudioStore((s) => s.pan);

  const [rect, setRect] = useState<DrawRect | null>(null);
  const startRef = useRef<{ x: number; y: number; viewportRect: DOMRect } | null>(null);

  const isDrawMode = DRAW_TOOLS.includes(activeTool);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (!isDrawMode) return;
    if ((event.target as HTMLElement).closest('[data-node-id]')) return;
    const viewportRect = event.currentTarget.getBoundingClientRect();
    startRef.current = { x: event.clientX, y: event.clientY, viewportRect };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }, [isDrawMode]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!startRef.current) return;
    const left = Math.min(startRef.current.x, event.clientX);
    const top = Math.min(startRef.current.y, event.clientY);
    const width = Math.abs(event.clientX - startRef.current.x);
    const height = Math.abs(event.clientY - startRef.current.y);
    if (width > 3 || height > 3) {
      setRect({ left, top, width, height });
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (rect && startRef.current && (rect.width > 8 || rect.height > 8)) {
      const canvasRect = canvasRectFromScreenRect(rect, startRef.current.viewportRect, pan, zoom);
      let newId: string;

      if (activeTool === 'text') {
        newId = addNode('text', undefined, {
          transform: {
            position: { x: canvasRect.x, y: canvasRect.y },
            size: { width: canvasRect.width, height: canvasRect.height },
            rotation: 0,
            scale: { x: 1, y: 1 },
          },
        });
      } else if (activeTool === 'rectangle' || activeTool === 'ellipse' || activeTool === 'line') {
        newId = addNode('vector', undefined, {
          transform: {
            position: { x: canvasRect.x, y: canvasRect.y },
            size: { width: canvasRect.width, height: canvasRect.height },
            rotation: 0,
            scale: { x: 1, y: 1 },
          },
        });
        const shapeMap = { rectangle: 'rectangle', ellipse: 'ellipse', line: 'line' } as const;
        updateVectorProps(newId, { shape: shapeMap[activeTool] });
      } else {
        newId = addNode('frame', undefined, {
          transform: {
            position: { x: canvasRect.x, y: canvasRect.y },
            size: { width: canvasRect.width, height: canvasRect.height },
            rotation: 0,
            scale: { x: 1, y: 1 },
          },
        });
      }

      updateNodeTransform(newId, {
        position: { x: canvasRect.x, y: canvasRect.y },
        size: { width: Math.max(canvasRect.width, 20), height: Math.max(canvasRect.height, 20) },
      });

      select([newId]);
      setActiveTool('select');
    }

    startRef.current = null;
    setRect(null);
  }, [rect, pan, zoom, activeTool, addNode, updateNodeTransform, updateVectorProps, select, setActiveTool]);

  if (!isDrawMode) return null;

  return (
    <div
      className="absolute inset-0 z-30"
      style={{ cursor: 'crosshair' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {rect && activeTool !== 'line' && (
        <div
          className={`absolute border-2 border-dashed border-indigo-400 bg-indigo-400/10 ${
            activeTool === 'ellipse' ? 'rounded-full' : 'rounded'
          }`}
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            position: 'fixed',
          }}
        />
      )}
      {rect && activeTool === 'line' && (
        <svg
          className="absolute pointer-events-none"
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            position: 'fixed',
            overflow: 'visible',
          }}
        >
          <line x1={0} y1={rect.height / 2} x2={rect.width} y2={rect.height / 2} stroke="#818cf8" strokeWidth={2} strokeDasharray="4" />
        </svg>
      )}
    </div>
  );
}
