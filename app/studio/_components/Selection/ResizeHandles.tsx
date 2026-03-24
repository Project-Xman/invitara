'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import { snapPosition, snapSize } from '~/studio/_lib/utils/snap';

interface ResizeHandlesProps {
  nodeId: string;
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type DragMode = 'resize' | 'rotate' | 'scale';

const HANDLE_POSITIONS: { pos: HandlePosition; cursor: string; style: React.CSSProperties }[] = [
  { pos: 'nw', cursor: 'nwse-resize', style: { top: -4, left: -4 } },
  { pos: 'n', cursor: 'ns-resize', style: { top: -4, left: '50%', transform: 'translateX(-50%)' } },
  { pos: 'ne', cursor: 'nesw-resize', style: { top: -4, right: -4 } },
  { pos: 'e', cursor: 'ew-resize', style: { top: '50%', right: -4, transform: 'translateY(-50%)' } },
  { pos: 'se', cursor: 'nwse-resize', style: { bottom: -4, right: -4 } },
  { pos: 's', cursor: 'ns-resize', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)' } },
  { pos: 'sw', cursor: 'nesw-resize', style: { bottom: -4, left: -4 } },
  { pos: 'w', cursor: 'ew-resize', style: { top: '50%', left: -4, transform: 'translateY(-50%)' } },
];

const EDGE_POSITIONS: { pos: HandlePosition; cursor: string; style: React.CSSProperties }[] = [
  { pos: 'n', cursor: 'ns-resize', style: { top: -2, left: '10%', right: '10%', height: 4 } },
  { pos: 's', cursor: 'ns-resize', style: { bottom: -2, left: '10%', right: '10%', height: 4 } },
  { pos: 'e', cursor: 'ew-resize', style: { right: -2, top: '10%', bottom: '10%', width: 4 } },
  { pos: 'w', cursor: 'ew-resize', style: { left: -2, top: '10%', bottom: '10%', width: 4 } },
];

export function ResizeHandles({ nodeId }: ResizeHandlesProps) {
  const dragRef = useRef<{
    mode: DragMode;
    pos?: HandlePosition;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startPosX: number;
    startPosY: number;
    startRotation: number;
    startScaleX: number;
    startScaleY: number;
    centerX: number;
    centerY: number;
    startPointerAngle: number;
    historyPushed: boolean;
  } | null>(null);

  const beginDrag = useCallback((event: React.PointerEvent, mode: DragMode, pos?: HandlePosition) => {
    event.stopPropagation();
    event.preventDefault();

    const state = useStudioStore.getState();
    const node = state.nodes[nodeId];
    if (!node || node.locked) return;
    const nodeElement = (event.currentTarget as HTMLElement).closest('[data-node-id]') as HTMLElement | null;
    const bounds = nodeElement?.getBoundingClientRect();
    const centerX = bounds ? bounds.left + bounds.width / 2 : event.clientX;
    const centerY = bounds ? bounds.top + bounds.height / 2 : event.clientY;
    const startPointerAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);

    dragRef.current = {
      mode,
      pos,
      startX: event.clientX,
      startY: event.clientY,
      startW: typeof node.transform.size.width === 'number' ? node.transform.size.width : 200,
      startH: typeof node.transform.size.height === 'number' ? node.transform.size.height : 200,
      startPosX: node.transform.position.x,
      startPosY: node.transform.position.y,
      startRotation: node.transform.rotation,
      startScaleX: node.transform.scale.x,
      startScaleY: node.transform.scale.y,
      centerX,
      centerY,
      startPointerAngle,
      historyPushed: false,
    };

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);
  }, [nodeId]);

  const onWindowPointerMove = useCallback((event: PointerEvent) => {
    if (!dragRef.current) return;

    const state = useStudioStore.getState();
    const zoom = state.zoom;
    if (!dragRef.current.historyPushed) {
      state.pushHistory();
      dragRef.current.historyPushed = true;
    }

    const dx = (event.clientX - dragRef.current.startX) / zoom;
    const dy = (event.clientY - dragRef.current.startY) / zoom;

    if (dragRef.current.mode === 'rotate') {
      const currentAngle = Math.atan2(
        event.clientY - dragRef.current.centerY,
        event.clientX - dragRef.current.centerX
      );
      const delta = Math.round(((currentAngle - dragRef.current.startPointerAngle) * 180) / Math.PI);
      state.updateNodeTransform(nodeId, {
        rotation: dragRef.current.startRotation + delta,
      });
      return;
    }

    if (dragRef.current.mode === 'scale') {
      state.updateNodeTransform(nodeId, {
        scale: {
          x: Math.max(0.1, dragRef.current.startScaleX + dx / Math.max(dragRef.current.startW, 1)),
          y: Math.max(0.1, dragRef.current.startScaleY + dy / Math.max(dragRef.current.startH, 1)),
        },
      });
      return;
    }

    const pos = dragRef.current.pos;
    if (!pos) return;

    let newWidth = dragRef.current.startW;
    let newHeight = dragRef.current.startH;
    let newX = dragRef.current.startPosX;
    let newY = dragRef.current.startPosY;

    if (pos.includes('e')) {
      newWidth = Math.max(20, dragRef.current.startW + dx);
    }
    if (pos.includes('w')) {
      newWidth = Math.max(20, dragRef.current.startW - dx);
      newX = dragRef.current.startPosX + (dragRef.current.startW - newWidth);
    }
    if (pos.includes('s')) {
      newHeight = Math.max(20, dragRef.current.startH + dy);
    }
    if (pos.includes('n')) {
      newHeight = Math.max(20, dragRef.current.startH - dy);
      newY = dragRef.current.startPosY + (dragRef.current.startH - newHeight);
    }

    const snappedSize = snapSize(newWidth, newHeight, state.showGrid);
    const snappedPosition = snapPosition(newX, newY, state.showGrid);

    state.updateNodeTransform(nodeId, {
      size: {
        width: snappedSize.width,
        height: snappedSize.height,
      },
      position: {
        x: snappedPosition.x,
        y: snappedPosition.y,
      },
    });
  }, [nodeId]);

  const onWindowPointerUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('pointermove', onWindowPointerMove);
    window.removeEventListener('pointerup', onWindowPointerUp);
  }, [onWindowPointerMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
    };
  }, [onWindowPointerMove, onWindowPointerUp]);

  return (
    <>
      {EDGE_POSITIONS.map(({ pos, cursor, style }) => (
        <div
          key={`edge-${pos}`}
          onPointerDown={(event) => beginDrag(event, 'resize', pos)}
          className="absolute z-[59] hover:bg-blue-400/20"
          style={{ ...style, cursor, pointerEvents: 'auto' }}
        />
      ))}

      {HANDLE_POSITIONS.map(({ pos, cursor, style }) => (
        <div
          key={pos}
          onPointerDown={(event) => beginDrag(event, 'resize', pos)}
          className="absolute w-2 h-2 bg-white border-2 border-blue-500 rounded-sm z-[60] hover:scale-150 transition-transform"
          style={{ ...style, cursor, pointerEvents: 'auto' }}
        />
      ))}

      <div
        onPointerDown={(event) => beginDrag(event, 'rotate')}
        className="absolute left-1/2 -translate-x-1/2 -top-8 z-[60] w-3 h-3 rounded-full border-2 border-fuchsia-400 bg-neutral-950"
        style={{ pointerEvents: 'auto', cursor: 'grab' }}
      />
      <div className="absolute left-1/2 -translate-x-1/2 -top-5 h-4 w-px bg-fuchsia-400/70 z-[59]" />

      <div
        onPointerDown={(event) => beginDrag(event, 'scale')}
        className="absolute -bottom-6 -right-6 z-[60] flex h-3 w-3 items-center justify-center rounded-sm border border-emerald-400 bg-neutral-950 text-[8px] text-emerald-300"
        style={{ pointerEvents: 'auto', cursor: 'nwse-resize' }}
      >
        S
      </div>
    </>
  );
}
