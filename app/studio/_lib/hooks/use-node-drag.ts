'use client';

import { useCallback, useRef } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import { snapPosition } from '~/studio/_lib/utils/snap';

interface DragState {
  nodeIds: string[];
  startX: number;
  startY: number;
  origins: Record<string, { x: number; y: number }>;
}

export function useNodeDrag() {
  const dragRef = useRef<DragState | null>(null);
  const historyPushed = useRef(false);

  const startDrag = useCallback((nodeId: string, clientX: number, clientY: number) => {
    const state = useStudioStore.getState();
    const node = state.nodes[nodeId];
    if (!node || node.locked) return;

    if (node.parentId) {
      const parent = state.nodes[node.parentId];
      if (parent && parent.layout.mode !== 'absolute') return;
    }

    const nodeIds = state.selectedIds.includes(nodeId) ? state.selectedIds : [nodeId];
    const draggableIds = nodeIds.filter((id) => {
      const candidate = state.nodes[id];
      if (!candidate || candidate.locked) return false;
      if (!candidate.parentId) return true;
      const parent = state.nodes[candidate.parentId];
      return !parent || parent.layout.mode === 'absolute';
    });

    dragRef.current = {
      nodeIds: draggableIds,
      startX: clientX,
      startY: clientY,
      origins: Object.fromEntries(
        draggableIds.map((id) => [id, { ...state.nodes[id].transform.position }])
      ),
    };
    historyPushed.current = false;
  }, []);

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragRef.current) return false;
    const state = useStudioStore.getState();
    const dx = (clientX - dragRef.current.startX) / state.zoom;
    const dy = (clientY - dragRef.current.startY) / state.zoom;

    if (!historyPushed.current) {
      state.pushHistory();
      historyPushed.current = true;
    }

    for (const nodeId of dragRef.current.nodeIds) {
      const node = state.nodes[nodeId];
      const origin = dragRef.current.origins[nodeId];
      if (!node || !origin) continue;
      const snapped = snapPosition(origin.x + dx, origin.y + dy, state.showGrid);
      state.updateNodeTransform(nodeId, {
        position: snapped,
      });
    }

    return true;
  }, []);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    historyPushed.current = false;
  }, []);

  const isDragging = useCallback(() => dragRef.current !== null, []);

  return { startDrag, moveDrag, endDrag, isDragging };
}
