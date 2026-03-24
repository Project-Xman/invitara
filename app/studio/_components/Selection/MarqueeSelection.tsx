'use client';

import { useCallback, useRef, useState } from 'react';
import { useStudioStore } from '~/studio/_lib/store';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function MarqueeSelection() {
  const [rect, setRect] = useState<Rect | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const select = useStudioStore((s) => s.select);
  const nodes = useStudioStore((s) => s.nodes);
  const activeTool = useStudioStore((s) => s.activeTool);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (activeTool !== 'select') return;
      // Only start marquee from the canvas background (not on nodes)
      if ((e.target as HTMLElement).closest('[data-node-id]')) return;

      startRef.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [activeTool]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current) return;
      const x = Math.min(startRef.current.x, e.clientX);
      const y = Math.min(startRef.current.y, e.clientY);
      const width = Math.abs(e.clientX - startRef.current.x);
      const height = Math.abs(e.clientY - startRef.current.y);
      if (width > 3 || height > 3) {
        setRect({ x, y, width, height });
      }
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    if (rect) {
      // Find all node elements intersecting the marquee
      const marqueeRect = { left: rect.x, top: rect.y, right: rect.x + rect.width, bottom: rect.y + rect.height };
      const matchingIds: string[] = [];

      const nodeEls = document.querySelectorAll('[data-node-id]');
      nodeEls.forEach((el) => {
        const bounds = el.getBoundingClientRect();
        const intersects =
          bounds.left < marqueeRect.right &&
          bounds.right > marqueeRect.left &&
          bounds.top < marqueeRect.bottom &&
          bounds.bottom > marqueeRect.top;

        if (intersects) {
          const id = el.getAttribute('data-node-id');
          if (id) matchingIds.push(id);
        }
      });

      if (matchingIds.length > 0) {
        select(matchingIds);
      }
    }

    startRef.current = null;
    setRect(null);
  }, [rect, select]);

  return (
    <div
      className="absolute inset-0 z-40"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="absolute inset-0"
        style={{ pointerEvents: 'auto' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {rect && (
        <div
          className="absolute border border-blue-400 bg-blue-400/10"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            pointerEvents: 'none',
            position: 'fixed',
          }}
        />
      )}
    </div>
  );
}
