'use client';

import React, { useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useStudioStore } from '~/studio/_lib/store';

interface DndProviderProps {
  children: React.ReactNode;
}

export function DndProvider({ children }: DndProviderProps) {
  const moveNode = useStudioStore((s) => s.moveNode);
  const nodes = useStudioStore((s) => s.nodes);
  const select = useStudioStore((s) => s.select);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeNodeId = active.id as string;
      const overNodeId = over.id as string;
      const overNode = nodes[overNodeId];

      if (!overNode) return;

      // If dropping on a frame/component, nest inside it
      if (overNode.type === 'frame' || overNode.type === 'component') {
        moveNode(activeNodeId, overNodeId, overNode.childrenIds.length);
      } else {
        // Drop as sibling (after the target)
        const parentId = overNode.parentId;
        if (parentId && nodes[parentId]) {
          const siblings = nodes[parentId].childrenIds;
          const targetIndex = siblings.indexOf(overNodeId) + 1;
          moveNode(activeNodeId, parentId, targetIndex);
        } else {
          // Both are root-level
          const store = useStudioStore.getState();
          const targetIndex = store.getCurrentPageRootIds().indexOf(overNodeId) + 1;
          moveNode(activeNodeId, null, targetIndex);
        }
      }

      select([activeNodeId]);
    },
    [nodes, moveNode, select]
  );

  const activeNode = activeId ? nodes[activeId] : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeNode && (
          <div className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded shadow-lg opacity-80">
            {activeNode.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
