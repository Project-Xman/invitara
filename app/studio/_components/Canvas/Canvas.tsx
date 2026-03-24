'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '~/studio/_lib/constants';
import { CanvasGrid } from './CanvasGrid';
import { DeviceFrame } from './DeviceFrame';
import { MarqueeSelection } from '../Selection/MarqueeSelection';
import { FrameDrawTool } from './FrameDrawTool';
import { PenTool } from './PenTool';
import { CanvasRulers } from './CanvasRulers';

export function Canvas() {
  const zoom = useStudioStore((s) => s.zoom);
  const pan = useStudioStore((s) => s.pan);
  const showGrid = useStudioStore((s) => s.showGrid);
  const setZoom = useStudioStore((s) => s.setZoom);
  const setPan = useStudioStore((s) => s.setPan);
  const clearSelection = useStudioStore((s) => s.clearSelection);
  const activeTool = useStudioStore((s) => s.activeTool);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOriginRef = useRef({ x: 0, y: 0 });

  // Keyboard listeners for space bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpaceDown(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Wheel handler: Ctrl+wheel = zoom, plain wheel = pan
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect) return;

        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        const delta = -e.deltaY * 0.01;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
        const scale = newZoom / zoom;

        setPan({
          x: cursorX - scale * (cursorX - pan.x),
          y: cursorY - scale * (cursorY - pan.y),
        });
        setZoom(newZoom);
      } else {
        setPan({
          x: pan.x - e.deltaX,
          y: pan.y - e.deltaY,
        });
      }
    },
    [zoom, pan, setZoom, setPan]
  );

  // Pan via pointer (space+drag or middle mouse)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isSpaceDown || e.button === 1 || activeTool === 'hand') {
        e.preventDefault();
        setIsPanning(true);
        panStartRef.current = { x: e.clientX, y: e.clientY };
        panOriginRef.current = { ...pan };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [isSpaceDown, pan, activeTool]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: panOriginRef.current.x + dx,
        y: panOriginRef.current.y + dy,
      });
    },
    [isPanning, setPan]
  );

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Click on empty canvas deselects
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  return (
    <div
      ref={viewportRef}
      className="absolute inset-0 overflow-hidden"
      style={{ cursor: isPanning ? 'grabbing' : isSpaceDown || activeTool === 'hand' ? 'grab' : activeTool === 'frame' || activeTool === 'text' || activeTool === 'rectangle' || activeTool === 'ellipse' || activeTool === 'line' || activeTool === 'pen' ? 'crosshair' : 'default' }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleCanvasClick}
    >
      <CanvasRulers />
      {showGrid && <CanvasGrid zoom={zoom} pan={pan} />}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <DeviceFrame />
      </div>
      <FrameDrawTool />
      <PenTool />
      <MarqueeSelection />
    </div>
  );
}
