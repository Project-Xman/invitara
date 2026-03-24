'use client';

import { useCallback, useState } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import { screenToCanvasPoint } from '~/studio/_lib/utils/coordinates';

interface Point {
  x: number;
  y: number;
}

export function PenTool() {
  const activeTool = useStudioStore((s) => s.activeTool);
  const addNode = useStudioStore((s) => s.addNode);
  const updateNode = useStudioStore((s) => s.updateNode);
  const select = useStudioStore((s) => s.select);
  const setActiveTool = useStudioStore((s) => s.setActiveTool);
  const zoom = useStudioStore((s) => s.zoom);
  const pan = useStudioStore((s) => s.pan);

  const [points, setPoints] = useState<Point[]>([]);
  const [currentPos, setCurrentPos] = useState<Point | null>(null);

  if (activeTool !== 'pen') return null;

  const toCanvas = (clientX: number, clientY: number, viewportRect: DOMRect): Point =>
    screenToCanvasPoint(clientX, clientY, viewportRect, pan, zoom);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    const pt = toCanvas(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
    setPoints((prev) => [...prev, pt]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setCurrentPos(toCanvas(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect()));
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (points.length < 2) {
      setPoints([]);
      return;
    }

    // Calculate bounding box
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const w = Math.max(maxX - minX, 20);
    const h = Math.max(maxY - minY, 20);

    // Generate smooth bezier path using Catmull-Rom to cubic bezier
    const normalized = points.map((p) => ({ x: p.x - minX, y: p.y - minY }));
    let normalizedPath = `M ${normalized[0].x} ${normalized[0].y}`;

    if (normalized.length === 2) {
      normalizedPath += ` L ${normalized[1].x} ${normalized[1].y}`;
    } else {
      for (let i = 0; i < normalized.length - 1; i++) {
        const p0 = normalized[Math.max(i - 1, 0)];
        const p1 = normalized[i];
        const p2 = normalized[Math.min(i + 1, normalized.length - 1)];
        const p3 = normalized[Math.min(i + 2, normalized.length - 1)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        normalizedPath += ` C ${Math.round(cp1x)} ${Math.round(cp1y)}, ${Math.round(cp2x)} ${Math.round(cp2y)}, ${Math.round(p2.x)} ${Math.round(p2.y)}`;
      }
    }

    const newId = addNode('vector');
    const node = useStudioStore.getState().nodes[newId];
    if (node) {
      updateNode(newId, {
        transform: { ...node.transform, size: { width: w, height: h }, position: { x: minX, y: minY } },
        vectorProps: {
          shape: 'path',
          fill: 'none',
          stroke: '#6366f1',
          strokeWidth: 2,
          pathData: normalizedPath,
        },
      });
    }
    select([newId]);
    setPoints([]);
    setActiveTool('select');
  };

  // Render preview of path being drawn
  const allPoints = currentPos ? [...points, currentPos] : points;
  let previewPath = '';
  if (allPoints.length > 0) {
    const screenPts = allPoints.map((pt) => ({
      x: pt.x * zoom + pan.x,
      y: pt.y * zoom + pan.y,
    }));
    previewPath = `M ${screenPts[0].x} ${screenPts[0].y}`;
    if (screenPts.length === 2) {
      previewPath += ` L ${screenPts[1].x} ${screenPts[1].y}`;
    } else if (screenPts.length > 2) {
      for (let i = 0; i < screenPts.length - 1; i++) {
        const p0 = screenPts[Math.max(i - 1, 0)];
        const p1 = screenPts[i];
        const p2 = screenPts[Math.min(i + 1, screenPts.length - 1)];
        const p3 = screenPts[Math.min(i + 2, screenPts.length - 1)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        previewPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
    }
  }

  return (
    <div
      className="absolute inset-0 z-30"
      style={{ cursor: 'crosshair' }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseMove={handleMouseMove}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {previewPath && (
          <path d={previewPath} fill="none" stroke="#818cf8" strokeWidth={2} strokeDasharray="6 3" />
        )}
        {points.map((pt, i) => {
          const sx = pt.x * zoom + pan.x;
          const sy = pt.y * zoom + pan.y;
          return (
            <circle key={i} cx={sx} cy={sy} r={4} fill="#818cf8" stroke="white" strokeWidth={1.5} />
          );
        })}
      </svg>
      {points.length > 0 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-[10px] text-neutral-400 pointer-events-none">
          Click to add points, double-click to finish. {points.length} points
        </div>
      )}
    </div>
  );
}
