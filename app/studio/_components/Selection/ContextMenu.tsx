'use client';

import { useCallback, useEffect, useState } from 'react';
import { useStudioStore } from '~/studio/_lib/store';

interface MenuPosition {
  x: number;
  y: number;
  nodeId: string | null;
}

export function ContextMenu() {
  const [pos, setPos] = useState<MenuPosition | null>(null);
  const selectedIds = useStudioStore((s) => s.selectedIds);
  const nodes = useStudioStore((s) => s.nodes);
  const deleteNodes = useStudioStore((s) => s.deleteNodes);
  const duplicateNodes = useStudioStore((s) => s.duplicateNodes);
  const copy = useStudioStore((s) => s.copy);
  const paste = useStudioStore((s) => s.paste);
  const cut = useStudioStore((s) => s.cut);
  const select = useStudioStore((s) => s.select);
  const createComponent = useStudioStore((s) => s.createComponent);
  const detachInstance = useStudioStore((s) => s.detachInstance);
  const updateNode = useStudioStore((s) => s.updateNode);
  const moveNode = useStudioStore((s) => s.moveNode);
  const groupNodes = useStudioStore((s) => s.groupNodes);
  const ungroupNode = useStudioStore((s) => s.ungroupNode);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const nodeEl = (e.target as HTMLElement).closest('[data-node-id]');
      const nodeId = nodeEl?.getAttribute('data-node-id') ?? null;

      // Only show on canvas area
      const isCanvas = (e.target as HTMLElement).closest('.absolute.inset-0.overflow-hidden');
      if (!isCanvas) return;

      e.preventDefault();
      if (nodeId && !selectedIds.includes(nodeId)) {
        select([nodeId]);
      }
      setPos({ x: e.clientX, y: e.clientY, nodeId });
    };

    const handleClick = () => setPos(null);
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setPos(null); };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIds, select]);

  const close = useCallback(() => setPos(null), []);

  if (!pos) return null;

  const hasSelection = selectedIds.length > 0;
  const singleNode = selectedIds.length === 1 ? nodes[selectedIds[0]] : null;
  const isFrame = singleNode?.type === 'frame';
  const isComponent = singleNode?.type === 'component';

  const items: { label: string; shortcut?: string; action: () => void; disabled?: boolean; separator?: boolean }[] = [
    { label: 'Copy', shortcut: 'Cmd+C', action: () => { copy(); close(); }, disabled: !hasSelection },
    { label: 'Cut', shortcut: 'Cmd+X', action: () => { cut(); close(); }, disabled: !hasSelection },
    { label: 'Paste', shortcut: 'Cmd+V', action: () => { paste(); close(); } },
    { label: 'Duplicate', shortcut: 'Cmd+D', action: () => { duplicateNodes([...selectedIds]); close(); }, disabled: !hasSelection },
    { label: '', action: () => {}, separator: true },
    { label: 'Delete', shortcut: 'Del', action: () => { deleteNodes([...selectedIds]); close(); }, disabled: !hasSelection },
    { label: '', action: () => {}, separator: true },
    {
      label: singleNode?.locked ? 'Unlock' : 'Lock',
      action: () => { if (singleNode) { updateNode(singleNode.id, { locked: !singleNode.locked }); close(); } },
      disabled: !singleNode,
    },
    {
      label: singleNode?.visible === false ? 'Show' : 'Hide',
      action: () => { if (singleNode) { updateNode(singleNode.id, { visible: !singleNode.visible }); close(); } },
      disabled: !singleNode,
    },
    { label: '', action: () => {}, separator: true },
    {
      label: 'Create Component',
      action: () => { if (singleNode) { createComponent(singleNode.id); close(); } },
      disabled: !isFrame,
    },
    {
      label: 'Detach Instance',
      action: () => { if (singleNode) { detachInstance(singleNode.id); close(); } },
      disabled: !isComponent,
    },
    {
      label: 'Group Selection',
      shortcut: 'Cmd+Shift+G',
      action: () => {
        if (selectedIds.length > 1) {
          const groupId = groupNodes([...selectedIds]);
          if (groupId) select([groupId]);
        }
        close();
      },
      disabled: selectedIds.length < 2,
    },
    {
      label: 'Ungroup',
      action: () => { if (singleNode) { ungroupNode(singleNode.id); close(); } },
      disabled: !singleNode || singleNode.childrenIds.length === 0,
    },
    { label: '', action: () => {}, separator: true },
    {
      label: 'Bring to Front',
      action: () => {
        if (singleNode) {
          const parentId = singleNode.parentId;
          const siblings = parentId
            ? nodes[parentId]?.childrenIds
            : useStudioStore.getState().getCurrentPageRootIds();
          moveNode(singleNode.id, parentId, siblings?.length ?? 0);
          close();
        }
      },
      disabled: !singleNode,
    },
    {
      label: 'Send to Back',
      action: () => {
        if (singleNode) {
          moveNode(singleNode.id, singleNode.parentId, 0);
          close();
        }
      },
      disabled: !singleNode,
    },
  ];

  return (
    <div
      className="fixed z-[200] bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl py-1 min-w-[180px]"
      style={{ left: pos.x, top: pos.y }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="h-px bg-neutral-800 my-1" />
        ) : (
          <button
            key={i}
            onClick={item.action}
            disabled={item.disabled}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-neutral-200">{item.label}</span>
            {item.shortcut && <span className="text-neutral-600 text-[10px] ml-4">{item.shortcut}</span>}
          </button>
        )
      )}
    </div>
  );
}
