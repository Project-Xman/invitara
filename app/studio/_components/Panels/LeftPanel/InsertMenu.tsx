'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { NodeType } from '~/studio/_lib/types';

const INSERT_ITEMS: { type: NodeType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    type: 'frame',
    label: 'Frame',
    description: 'Container with layout',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Text element',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
      </svg>
    ),
  },
  {
    type: 'image',
    label: 'Image',
    description: 'Image element',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    type: '3d',
    label: '3D Object',
    description: '3D shape or model',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l10 6v8l-10 6-10-6V8z" /><path d="M12 22V10" /><path d="M22 8l-10 4-10-4" />
      </svg>
    ),
  },
  {
    type: 'vector',
    label: 'Vector',
    description: 'Shape / SVG',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
      </svg>
    ),
  },
  {
    type: 'ad',
    label: 'Ad Container',
    description: 'Embeddable ad slot',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M8 12h8" /><path d="M12 8v8" />
      </svg>
    ),
  },
];

export function InsertMenu() {
  const addNode = useStudioStore((s) => s.addNode);
  const select = useStudioStore((s) => s.select);
  const selectedIds = useStudioStore((s) => s.selectedIds);
  const nodes = useStudioStore((s) => s.nodes);

  const handleInsert = useCallback(
    (type: NodeType) => {
      // Insert into selected frame if one is selected, otherwise root
      let parentId: string | undefined;
      if (selectedIds.length === 1) {
        const selectedNode = nodes[selectedIds[0]];
        if (selectedNode && (selectedNode.type === 'frame' || selectedNode.type === 'component')) {
          parentId = selectedIds[0];
        }
      }
      const newId = addNode(type, parentId);
      select([newId]);
    },
    [addNode, select, selectedIds, nodes]
  );

  return (
    <div className="p-2 space-y-1">
      {INSERT_ITEMS.map((item) => (
        <button
          key={item.type}
          onClick={() => handleInsert(item.type)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-neutral-800 transition-colors group"
        >
          <div className="text-neutral-400 group-hover:text-indigo-400 transition-colors">
            {item.icon}
          </div>
          <div>
            <div className="text-sm text-neutral-200">{item.label}</div>
            <div className="text-[11px] text-neutral-500">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
