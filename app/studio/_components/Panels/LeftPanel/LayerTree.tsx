'use client';

import React, { useCallback, useState, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStudioStore } from '~/studio/_lib/store';

const TYPE_ICONS: Record<string, string> = {
  frame: '\u25A2',
  text: 'T',
  image: '\u25A3',
  component: '\u25C7',
  '3d': '\u25B3',
  vector: '\u2B21',
  ad: '\u25A4',
};

interface SortableLayerItemProps {
  nodeId: string;
  depth: number;
  searchQuery?: string;
}

function SortableLayerItem({ nodeId, depth, searchQuery }: SortableLayerItemProps) {
  const node = useStudioStore((s) => s.nodes[nodeId]);
  const isSelected = useStudioStore((s) => s.selectedIds.includes(nodeId));
  const select = useStudioStore((s) => s.select);
  const updateNode = useStudioStore((s) => s.updateNode);

  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: nodeId });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      select([nodeId], e.shiftKey);
    },
    [nodeId, select]
  );

  const toggleVisibility = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateNode(nodeId, { visible: !node?.visible });
    },
    [nodeId, node?.visible, updateNode]
  );

  const toggleLock = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateNode(nodeId, { locked: !node?.locked });
    },
    [nodeId, node?.locked, updateNode]
  );

  if (!node) return null;

  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={handleClick}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs cursor-grab active:cursor-grabbing transition-colors ${
          isSelected
            ? 'bg-indigo-600/20 text-indigo-300'
            : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
        }`}
        style={{ ...sortableStyle, paddingLeft: 8 + depth * 16 }}
      >
        {/* Collapse/Expand */}
        {node.childrenIds.length > 0 ? (
          <button
            onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
            className="text-[10px] text-neutral-500 w-3 shrink-0"
          >
            {collapsed ? '\u25B6' : '\u25BC'}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}

        {/* Thumbnail */}
        <div
          className="w-3 h-3 rounded-sm shrink-0 border border-neutral-700"
          style={{
            backgroundColor: node.type === 'vector' ? node.vectorProps?.fill :
              node.style.backgroundColor ?? (node.type === 'text' ? 'transparent' : '#374151'),
          }}
        >
          <span className="text-[7px] text-white/60 flex items-center justify-center h-full">
            {TYPE_ICONS[node.type] ?? '?'}
          </span>
        </div>

        {/* Inline Rename */}
        {isEditing ? (
          <input
            autoFocus
            defaultValue={node.name}
            onBlur={(e) => {
              updateNode(nodeId, { name: e.target.value || node.name });
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') setIsEditing(false);
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-0.5 py-0 text-xs bg-neutral-700 border border-indigo-500 rounded text-neutral-200 outline-none min-w-0"
          />
        ) : (
          <span
            className="truncate flex-1"
            onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          >
            {node.name}
          </span>
        )}

        <button onClick={toggleVisibility} className="opacity-40 hover:opacity-100 text-[10px] shrink-0" title={node.visible ? 'Hide' : 'Show'}>
          {node.visible ? '\u25C9' : '\u25CE'}
        </button>
        <button onClick={toggleLock} className="opacity-40 hover:opacity-100 text-[10px] shrink-0" title={node.locked ? 'Unlock' : 'Lock'}>
          {node.locked ? '\u26BF' : '\u26C1'}
        </button>

        {node.style.opacity < 1 && (
          <span className="text-[8px] text-neutral-600 tabular-nums shrink-0">
            {Math.round(node.style.opacity * 100)}%
          </span>
        )}
      </div>

      {!collapsed && node.childrenIds.map((childId) => (
        <SortableLayerItem key={childId} nodeId={childId} depth={depth + 1} searchQuery={searchQuery} />
      ))}
    </>
  );
}

function flattenIds(rootIds: string[], nodes: Record<string, any>): string[] {
  const result: string[] = [];
  const walk = (ids: string[]) => {
    for (const id of ids) {
      result.push(id);
      const node = nodes[id];
      if (node?.childrenIds?.length) walk(node.childrenIds);
    }
  };
  walk(rootIds);
  return result;
}

interface LayerTreeProps {
  searchQuery?: string;
}

export function LayerTree({ searchQuery = '' }: LayerTreeProps) {
  const rootIds = useStudioStore((s) => s.pages[s.activePageId]?.rootIds ?? []);
  const nodes = useStudioStore((s) => s.nodes);
  const moveNode = useStudioStore((s) => s.moveNode);
  const selectedIds = useStudioStore((s) => s.selectedIds);
  const selectFn = useStudioStore((s) => s.select);
  const groupNodes = useStudioStore((s) => s.groupNodes);
  const ungroupNode = useStudioStore((s) => s.ungroupNode);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const query = searchQuery.toLowerCase().trim();

  const matchingIds = new Set<string>();
  if (query) {
    for (const [id, node] of Object.entries(nodes)) {
      if (node.name.toLowerCase().includes(query) || node.type.toLowerCase().includes(query)) {
        let current: string | null = id;
        while (current) {
          matchingIds.add(current);
          current = nodes[current]?.parentId ?? null;
        }
      }
    }
  }

  const filteredRootIds = query ? rootIds.filter((id) => matchingIds.has(id)) : rootIds;
  const allIds = flattenIds(filteredRootIds, nodes);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDragActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const activeNode = nodes[activeId];
      const overNode = nodes[overId];
      if (!activeNode || !overNode) return;

      // Prevent dropping a parent into its own child
      const isDescendant = (parentId: string, childId: string): boolean => {
        const node = nodes[childId];
        if (!node) return false;
        if (node.parentId === parentId) return true;
        if (node.parentId) return isDescendant(parentId, node.parentId);
        return false;
      };
      if (isDescendant(activeId, overId)) return;

      // Place activeNode at overNode's position (as sibling, right after overNode)
      const overParentId = overNode.parentId;
      if (overParentId && nodes[overParentId]) {
        const siblings = nodes[overParentId].childrenIds;
        let targetIdx = siblings.indexOf(overId);
        // If active is already in same parent and before over, adjust index
        if (activeNode.parentId === overParentId) {
          const activeIdx = siblings.indexOf(activeId);
          if (activeIdx < targetIdx) targetIdx--; // account for removal
        }
        moveNode(activeId, overParentId, targetIdx + 1);
      } else {
        // over is root-level
        let targetIdx = rootIds.indexOf(overId);
        if (!activeNode.parentId) {
          const activeIdx = rootIds.indexOf(activeId);
          if (activeIdx < targetIdx) targetIdx--;
        }
        moveNode(activeId, null, targetIdx + 1);
      }
    },
    [nodes, rootIds, moveNode]
  );

  const dragActiveNode = dragActiveId ? nodes[dragActiveId] : null;

  if (query && matchingIds.size === 0) {
    return (
      <div className="p-3 text-xs text-neutral-500">
        No layers match &ldquo;{searchQuery}&rdquo;
      </div>
    );
  }

  if (rootIds.length === 0) {
    return (
      <div className="p-3 text-xs text-neutral-500">
        No layers. Add elements from the Insert panel.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
        {/* Group/Ungroup actions */}
        <div className="flex gap-1 px-2 py-1 border-b border-neutral-800">
          <button
            onClick={() => { const id = groupNodes([...selectedIds]); if (id) selectFn([id]); }}
            disabled={selectedIds.length < 2}
            className="flex-1 py-1 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded disabled:opacity-20 transition-colors"
          >
            Group
          </button>
          <button
            onClick={() => { if (selectedIds.length === 1) ungroupNode(selectedIds[0]); }}
            disabled={selectedIds.length !== 1 || !nodes[selectedIds[0]]?.childrenIds?.length}
            className="flex-1 py-1 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded disabled:opacity-20 transition-colors"
          >
            Ungroup
          </button>
        </div>

        <div className="py-1">
          {filteredRootIds.map((id) => (
            <SortableLayerItem key={id} nodeId={id} depth={0} searchQuery={searchQuery} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {dragActiveNode && (
          <div className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded shadow-lg opacity-90 whitespace-nowrap">
            {TYPE_ICONS[dragActiveNode.type] ?? '?'} {dragActiveNode.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
