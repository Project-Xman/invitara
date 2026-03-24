'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode, LayoutMode, StackDirection, Alignment } from '~/studio/_lib/types';

interface LayoutInspectorProps {
  node: StudioNode;
}

export function LayoutInspector({ node }: LayoutInspectorProps) {
  const updateNodeLayout = useStudioStore((s) => s.updateNodeLayout);

  const updateLayout = useCallback(
    (patch: Partial<typeof node.layout>) => {
      updateNodeLayout(node.id, patch);
    },
    [node, updateNodeLayout]
  );

  // Only show for frame/component
  if (node.type !== 'frame' && node.type !== 'component') {
    return null;
  }

  const { layout } = node;

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">Layout</div>

      {/* Layout mode */}
      <div className="flex gap-1">
        {(['stack', 'grid', 'absolute'] as LayoutMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => updateLayout({ mode })}
            className={`flex-1 px-2 py-1 text-[11px] rounded capitalize transition-colors ${
              layout.mode === mode
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Stack direction */}
      {layout.mode === 'stack' && (
        <div className="flex gap-1">
          {(['horizontal', 'vertical'] as StackDirection[]).map((dir) => (
            <button
              key={dir}
              onClick={() => updateLayout({ direction: dir })}
              className={`flex-1 px-2 py-1 text-[11px] rounded capitalize transition-colors ${
                layout.direction === dir
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>
      )}

      {/* Grid columns */}
      {layout.mode === 'grid' && (
        <label className="block space-y-1">
          <span className="text-[10px] text-neutral-500">Columns</span>
          <input
            type="number"
            min={1}
            max={12}
            value={layout.gridColumns ?? 2}
            onChange={(e) => updateLayout({ gridColumns: parseInt(e.target.value) || 2 })}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
      )}

      {/* Gap */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Gap</span>
        <input
          type="number"
          min={0}
          value={layout.gap}
          onChange={(e) => updateLayout({ gap: parseInt(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      {/* Padding */}
      <div className="space-y-1">
        <span className="text-[10px] text-neutral-500">Padding</span>
        <div className="grid grid-cols-4 gap-1">
          {(['Top', 'Right', 'Bottom', 'Left'] as const).map((label, i) => (
            <label key={label} className="space-y-0.5">
              <span className="text-[9px] text-neutral-600 block text-center">{label[0]}</span>
              <input
                type="number"
                min={0}
                value={layout.padding[i]}
                onChange={(e) => {
                  const newPadding = [...layout.padding] as [number, number, number, number];
                  newPadding[i] = parseInt(e.target.value) || 0;
                  updateLayout({ padding: newPadding });
                }}
                className="w-full px-1.5 py-1 text-[11px] bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-center focus:border-indigo-500 focus:outline-none"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Alignment */}
      {layout.mode !== 'absolute' && (
        <>
          <label className="block space-y-1">
            <span className="text-[10px] text-neutral-500">Align Items</span>
            <select
              value={layout.alignItems}
              onChange={(e) => updateLayout({ alignItems: e.target.value as Alignment })}
              className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="stretch">Stretch</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] text-neutral-500">Justify Content</span>
            <select
              value={layout.justifyContent}
              onChange={(e) => updateLayout({ justifyContent: e.target.value as Alignment })}
              className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="space-between">Space Between</option>
            </select>
          </label>
        </>
      )}
    </div>
  );
}
