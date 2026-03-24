'use client';

import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useStudioStore } from '~/studio/_lib/store';

interface DraggableNodeProps {
  nodeId: string;
  children: React.ReactNode;
}

export function DraggableNode({ nodeId, children }: DraggableNodeProps) {
  const node = useStudioStore((s) => s.nodes[nodeId]);
  const parentLayout = useStudioStore((s) => {
    if (!node?.parentId) return null;
    return s.nodes[node.parentId]?.layout.mode ?? null;
  });

  // Disable DnD hierarchy reordering when node is in absolute mode (position drag takes over)
  const isAbsolute = !node?.parentId || parentLayout === 'absolute';

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: nodeId,
    disabled: node?.locked || isAbsolute,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: nodeId,
  });

  const canAcceptChildren = node?.type === 'frame' || node?.type === 'component';

  return (
    <div
      ref={(el) => {
        setDragRef(el);
        setDropRef(el);
      }}
      {...(isAbsolute ? {} : { ...attributes, ...listeners })}
      style={{
        opacity: isDragging ? 0.3 : 1,
        outline: isOver && canAcceptChildren ? '2px dashed #818cf8' : isOver ? '2px dashed #f59e0b' : undefined,
        outlineOffset: isOver ? 2 : undefined,
        background: isOver && canAcceptChildren ? 'rgba(129, 140, 248, 0.05)' : undefined,
        transition: 'outline 0.15s, opacity 0.15s',
      }}
    >
      {children}
    </div>
  );
}
