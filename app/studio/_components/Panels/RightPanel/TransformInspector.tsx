'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

interface TransformInspectorProps {
  node: StudioNode;
}

export function TransformInspector({ node }: TransformInspectorProps) {
  const updateNodeTransform = useStudioStore((s) => s.updateNodeTransform);

  const setSize = useCallback(
    (dim: 'width' | 'height', value: string) => {
      const numeric = parseInt(value, 10);
      updateNodeTransform(node.id, {
        size: {
          ...node.transform.size,
          [dim]: Number.isNaN(numeric) ? 'auto' : numeric,
        },
      });
    },
    [node, updateNodeTransform]
  );

  const setPosition = useCallback(
    (axis: 'x' | 'y', value: string) => {
      const numeric = parseInt(value, 10);
      updateNodeTransform(node.id, {
        position: {
          ...node.transform.position,
          [axis]: Number.isNaN(numeric) ? 0 : numeric,
        },
      });
    },
    [node, updateNodeTransform]
  );

  const setScale = useCallback(
    (axis: 'x' | 'y', value: string) => {
      const numeric = parseFloat(value);
      updateNodeTransform(node.id, {
        scale: {
          ...node.transform.scale,
          [axis]: Number.isFinite(numeric) ? numeric : 1,
        },
      });
    },
    [node, updateNodeTransform]
  );

  const setRotation = useCallback(
    (value: string) => {
      const numeric = parseInt(value, 10);
      updateNodeTransform(node.id, {
        rotation: Number.isNaN(numeric) ? 0 : numeric,
      });
    },
    [node, updateNodeTransform]
  );

  const widthValue = typeof node.transform.size.width === 'number' ? node.transform.size.width : '';
  const heightValue = typeof node.transform.size.height === 'number' ? node.transform.size.height : '';

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">Transform</div>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">X</span>
          <input
            type="number"
            value={node.transform.position.x}
            onChange={(event) => setPosition('x', event.target.value)}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Y</span>
          <input
            type="number"
            value={node.transform.position.y}
            onChange={(event) => setPosition('y', event.target.value)}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Width</span>
          <input
            type="text"
            value={widthValue}
            onChange={(event) => setSize('width', event.target.value)}
            placeholder="auto"
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Height</span>
          <input
            type="text"
            value={heightValue}
            onChange={(event) => setSize('height', event.target.value)}
            placeholder="auto"
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Scale X</span>
          <input
            type="number"
            step={0.05}
            min={0.1}
            value={node.transform.scale.x}
            onChange={(event) => setScale('x', event.target.value)}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Scale Y</span>
          <input
            type="number"
            step={0.05}
            min={0.1}
            value={node.transform.scale.y}
            onChange={(event) => setScale('y', event.target.value)}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Rotation</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={node.transform.rotation}
            onChange={(event) => setRotation(event.target.value)}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
          <span className="text-[10px] text-neutral-500 shrink-0">deg</span>
        </div>
      </label>

      {(node.type === 'frame' || node.type === 'component') && node.childrenIds.length > 0 && (
        <button
          onClick={() => {
            const element =
              document.querySelector(`[data-frame-id="${node.id}"]`) ??
              document.querySelector(`[data-component-id="${node.id}"]`);
            if (!element) return;
            const children = element.children;
            let maxWidth = 0;
            let maxHeight = 0;
            for (let index = 0; index < children.length; index++) {
              const child = children[index] as HTMLElement;
              maxWidth = Math.max(maxWidth, child.offsetLeft + child.offsetWidth);
              maxHeight = Math.max(maxHeight, child.offsetTop + child.offsetHeight);
            }
            const [paddingTop, paddingRight, paddingBottom, paddingLeft] = node.layout.padding;
            updateNodeTransform(node.id, {
              size: {
                width: Math.round(maxWidth + paddingRight + paddingLeft),
                height: Math.round(maxHeight + paddingTop + paddingBottom),
              },
            });
          }}
          className="w-full py-1.5 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
        >
          Fit to Content
        </button>
      )}
    </div>
  );
}
