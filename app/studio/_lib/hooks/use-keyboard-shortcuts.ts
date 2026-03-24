'use client';

import { useEffect } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useStudioStore.getState();

      // Don't intercept shortcuts when editing text
      if (state.focusedId) return;

      // Don't intercept when typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      const isMod = e.metaKey || e.ctrlKey;

      // Delete selected nodes
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedIds.length > 0) {
        e.preventDefault();
        state.deleteNodes([...state.selectedIds]);
        return;
      }

      // Undo: Cmd+Z
      if (isMod && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        state.undo();
        return;
      }

      // Redo: Cmd+Shift+Z or Cmd+Y
      if ((isMod && e.shiftKey && e.key === 'z') || (isMod && e.key === 'y')) {
        e.preventDefault();
        state.redo();
        return;
      }

      // Paste style: Cmd+Shift+V
      if (isMod && e.shiftKey && e.key === 'v') {
        e.preventDefault();
        state.pasteStyle();
        return;
      }

      // Copy: Cmd+C
      if (isMod && e.key === 'c') {
        e.preventDefault();
        state.copy();
        return;
      }

      // Paste: Cmd+V
      if (isMod && e.key === 'v') {
        e.preventDefault();
        state.paste();
        return;
      }

      // Cut: Cmd+X
      if (isMod && e.key === 'x') {
        e.preventDefault();
        state.cut();
        return;
      }

      // Duplicate: Cmd+D
      if (isMod && e.key === 'd' && state.selectedIds.length > 0) {
        e.preventDefault();
        state.duplicateNodes([...state.selectedIds]);
        return;
      }

      // Select all: Cmd+A
      if (isMod && e.key === 'a') {
        e.preventDefault();
        const selectedIds = Object.keys(state.nodes).filter((nodeId) => {
          let current: string | null = nodeId;
          while (current) {
            const currentNode: StudioNode | undefined = state.nodes[current];
            if (!currentNode) break;
            if (currentNode.parentId === null) {
              return state.getCurrentPageRootIds().includes(current);
            }
            current = currentNode.parentId;
          }
          return false;
        });
        state.select(selectedIds);
        return;
      }

      // Deselect: Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        state.clearSelection();
        return;
      }

      // Toggle grid: Cmd+G
      if (isMod && e.key === 'g') {
        e.preventDefault();
        state.toggleGrid();
        return;
      }

      // Tools: V=select, F=frame, T=text, H=hand
      if (!isMod && e.key === 'v') {
        state.setActiveTool('select');
        return;
      }
      if (!isMod && e.key === 'f') {
        state.setActiveTool('frame');
        return;
      }
      if (!isMod && e.key === 't') {
        state.setActiveTool('text');
        return;
      }
      if (!isMod && e.key === 'h') {
        state.setActiveTool('hand');
        return;
      }
      if (!isMod && e.key === 'r') {
        state.setActiveTool('rectangle');
        return;
      }
      if (!isMod && e.key === 'o') {
        state.setActiveTool('ellipse');
        return;
      }
      if (!isMod && e.key === 'l') {
        state.setActiveTool('line');
        return;
      }
      if (!isMod && e.key === 'p') {
        state.setActiveTool('pen');
        return;
      }

      // Zoom: Cmd+= (zoom in), Cmd+- (zoom out), Cmd+0 (reset)
      if (isMod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        state.setZoom(Math.min(5, state.zoom + 0.1));
        return;
      }
      if (isMod && e.key === '-') {
        e.preventDefault();
        state.setZoom(Math.max(0.1, state.zoom - 0.1));
        return;
      }
      if (isMod && e.key === '0') {
        e.preventDefault();
        state.setZoom(1);
        state.setPan({ x: 100, y: 50 });
        return;
      }

      // Arrow key nudge
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && state.selectedIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        for (const id of state.selectedIds) {
          const node = state.nodes[id];
          if (!node || node.locked) continue;
          const pos = { ...node.transform.position };
          if (e.key === 'ArrowUp') pos.y -= step;
          if (e.key === 'ArrowDown') pos.y += step;
          if (e.key === 'ArrowLeft') pos.x -= step;
          if (e.key === 'ArrowRight') pos.x += step;
          state.updateNode(id, { transform: { ...node.transform, position: pos } });
        }
        return;
      }

      // Z-order: Cmd+] (bring forward), Cmd+[ (send backward)
      if (isMod && e.key === ']' && state.selectedIds.length === 1) {
        e.preventDefault();
        const nodeId = state.selectedIds[0];
          const node = state.nodes[nodeId];
          if (node) {
            const parentId = node.parentId;
            const siblings = parentId ? state.nodes[parentId]?.childrenIds : state.getCurrentPageRootIds();
            if (siblings) {
              const idx = siblings.indexOf(nodeId);
              if (idx < siblings.length - 1) {
              state.moveNode(nodeId, parentId, idx + 2);
            }
          }
        }
        return;
      }
      if (isMod && e.key === '[' && state.selectedIds.length === 1) {
        e.preventDefault();
        const nodeId = state.selectedIds[0];
          const node = state.nodes[nodeId];
          if (node) {
            const parentId = node.parentId;
            const siblings = parentId ? state.nodes[parentId]?.childrenIds : state.getCurrentPageRootIds();
            if (siblings) {
              const idx = siblings.indexOf(nodeId);
              if (idx > 0) {
              state.moveNode(nodeId, parentId, idx - 1);
            }
          }
        }
        return;
      }

      // Export: Cmd+E
      if (isMod && e.key === 'e') {
        e.preventDefault();
        state.setExportDialogOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
