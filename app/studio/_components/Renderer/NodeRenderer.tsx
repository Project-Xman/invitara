'use client';

import React, { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import { ResizeHandles } from '../Selection/ResizeHandles';
import { FrameRenderer } from './FrameRenderer';
import { ComponentRenderer } from './ComponentRenderer';
import { TextRenderer } from './TextRenderer';
import { ImageRenderer } from './ImageRenderer';
import { ThreeDRenderer } from './ThreeDRenderer';
import { VectorRenderer } from './VectorRenderer';
import { AdRenderer } from './AdRenderer';
import { DraggableNode } from '../DragDrop/DraggableNode';
import { useNodeDrag } from '~/studio/_lib/hooks/use-node-drag';
import { resolveNodeStyles } from '~/studio/_lib/utils/style-resolver';

const RENDERER_MAP = {
  frame: FrameRenderer,
  text: TextRenderer,
  image: ImageRenderer,
  component: ComponentRenderer,
  '3d': ThreeDRenderer,
  vector: VectorRenderer,
  ad: AdRenderer,
} as const;

interface NodeRendererProps {
  nodeId: string;
}

export const NodeRenderer = React.memo(function NodeRenderer({ nodeId }: NodeRendererProps) {
  const node = useStudioStore((s) => s.nodes[nodeId]);
  const isSelected = useStudioStore((s) => s.selectedIds.includes(nodeId));
  const isHovered = useStudioStore((s) => s.hoveredId === nodeId);
  const select = useStudioStore((s) => s.select);
  const setHovered = useStudioStore((s) => s.setHovered);
  const device = useStudioStore((s) => s.device);
  const parentLayout = useStudioStore((s) => {
    if (!node?.parentId) return null;
    return s.nodes[node.parentId]?.layout.mode ?? null;
  });
  const { startDrag, moveDrag, endDrag } = useNodeDrag();
  const isAbsolute = !node?.parentId || parentLayout === 'absolute';

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      select([nodeId], e.shiftKey);
    },
    [nodeId, select]
  );

  const handleMouseEnter = useCallback(() => {
    setHovered(nodeId);
  }, [nodeId, setHovered]);

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, [setHovered]);

  if (!node || !node.visible) return null;

  const resolved = resolveNodeStyles(node, device);
  const resolvedNode = {
    ...node,
    style: resolved.style,
    transform: resolved.transform,
    layout: resolved.layout,
  };
  const Renderer = RENDERER_MAP[node.type] ?? FrameRenderer;
  const { position, rotation, scale } = resolvedNode.transform;
  const wrapperTransform = [
    rotation !== 0 ? `rotate(${rotation}deg)` : '',
    scale.x !== 1 || scale.y !== 1 ? `scale(${scale.x}, ${scale.y})` : '',
  ].filter(Boolean).join(' ');

  return (
    <DraggableNode nodeId={nodeId}>
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={(e) => {
          if (e.button === 0 && isAbsolute && !e.shiftKey) {
            startDrag(nodeId, e.clientX, e.clientY);
          }
        }}
        onPointerMove={(e) => moveDrag(e.clientX, e.clientY)}
        onPointerUp={endDrag}
        style={{
          position: isAbsolute ? 'absolute' : 'relative',
          left: isAbsolute ? position.x : undefined,
          top: isAbsolute ? position.y : undefined,
          transform: wrapperTransform || undefined,
          transformOrigin: 'center center',
        }}
        data-node-id={nodeId}
      >
        {(isSelected || isHovered) && (
          <div
            className="absolute inset-0 pointer-events-none z-50"
            style={{
              outline: isSelected ? '2px solid #4f8ff7' : '1px solid #4f8ff780',
              outlineOffset: -1,
              borderRadius: 'inherit',
            }}
          >
            {isSelected && <ResizeHandles nodeId={nodeId} />}
          </div>
        )}
        <Renderer node={resolvedNode}>
          {resolvedNode.childrenIds.map((childId) => (
            <NodeRenderer key={childId} nodeId={childId} />
          ))}
        </Renderer>
      </div>
    </DraggableNode>
  );
});
