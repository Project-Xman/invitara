'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

interface ComponentOverrideInspectorProps {
  node: StudioNode;
}

export function ComponentOverrideInspector({ node }: ComponentOverrideInspectorProps) {
  const updateNode = useStudioStore((s) => s.updateNode);
  const components = useStudioStore((s) => s.components);
  const detachInstance = useStudioStore((s) => s.detachInstance);

  const setOverride = useCallback(
    (key: string, value: unknown) => {
      if (!node.componentProps) return;
      updateNode(node.id, {
        componentProps: {
          ...node.componentProps,
          overrides: { ...node.componentProps.overrides, [key]: value },
        },
      });
    },
    [node, updateNode]
  );

  if (node.type !== 'component' || !node.componentProps) return null;

  const definition = components[node.componentProps.componentId];
  const overrides = node.componentProps.overrides;

  const clearOverride = useCallback(
    (key: string) => {
      if (!node.componentProps) return;
      const newOverrides = { ...node.componentProps.overrides };
      delete newOverrides[key];
      updateNode(node.id, {
        componentProps: { ...node.componentProps, overrides: newOverrides },
      });
    },
    [node, updateNode]
  );

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-purple-400 uppercase tracking-wider">Component</span>
        <button onClick={() => detachInstance(node.id)} className="text-[10px] text-neutral-500 hover:text-red-400">
          Detach
        </button>
      </div>

      {definition && (
        <div className="text-[11px] text-neutral-400">{definition.name}</div>
      )}

      <div className="text-[10px] text-neutral-500 uppercase">Overrides</div>

      <label className="flex items-center gap-2">
        <input type="color" value={(overrides.backgroundColor as string) ?? '#ffffff'}
          onChange={(e) => setOverride('backgroundColor', e.target.value)}
          className="w-5 h-5 rounded border border-neutral-600 cursor-pointer" />
        <span className="text-[10px] text-neutral-500">Background</span>
        {overrides.backgroundColor != null && (
          <button onClick={() => clearOverride('backgroundColor')} className="text-[9px] text-neutral-600 ml-auto">reset</button>
        )}
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Opacity Override</span>
        <input type="range" min={0} max={1} step={0.01}
          value={(overrides.opacity as number) ?? 1}
          onChange={(e) => setOverride('opacity', parseFloat(e.target.value))}
          className="w-full accent-purple-500" />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Width</span>
          <input type="number"
            value={(overrides.width as number) ?? ''}
            onChange={(e) => { const v = parseInt(e.target.value); if (v) setOverride('width', v); else clearOverride('width'); }}
            placeholder="inherit"
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-purple-700/50 rounded text-neutral-200 focus:border-purple-500 focus:outline-none" />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Height</span>
          <input type="number"
            value={(overrides.height as number) ?? ''}
            onChange={(e) => { const v = parseInt(e.target.value); if (v) setOverride('height', v); else clearOverride('height'); }}
            placeholder="inherit"
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-purple-700/50 rounded text-neutral-200 focus:border-purple-500 focus:outline-none" />
        </label>
      </div>
    </div>
  );
}
