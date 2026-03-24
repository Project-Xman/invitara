'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

interface GridEditorProps {
  node: StudioNode;
}

export function GridEditor({ node }: GridEditorProps) {
  const updateNode = useStudioStore((s) => s.updateNode);

  const updateLayout = useCallback(
    (patch: Partial<typeof node.layout>) => {
      updateNode(node.id, { layout: { ...node.layout, ...patch } });
    },
    [node, updateNode]
  );

  if (node.layout.mode !== 'grid') return null;

  const cols = node.layout.gridColumns ?? 2;
  const rows = node.layout.gridRows ?? 2;

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">Grid Editor</div>

      {/* Visual grid preview */}
      <div
        className="border border-neutral-700 rounded p-1"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 2,
          aspectRatio: `${cols} / ${rows}`,
        }}
      >
        {Array.from({ length: cols * rows }, (_, i) => (
          <div key={i} className="bg-neutral-800 rounded-sm min-h-[12px]" />
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Columns</span>
          <div className="flex items-center gap-1">
            <button onClick={() => updateLayout({ gridColumns: Math.max(1, cols - 1) })}
              className="w-6 h-6 text-xs bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400">-</button>
            <span className="text-xs text-neutral-200 w-6 text-center tabular-nums">{cols}</span>
            <button onClick={() => updateLayout({ gridColumns: Math.min(12, cols + 1) })}
              className="w-6 h-6 text-xs bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400">+</button>
          </div>
        </label>
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Rows</span>
          <div className="flex items-center gap-1">
            <button onClick={() => updateLayout({ gridRows: Math.max(1, rows - 1) })}
              className="w-6 h-6 text-xs bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400">-</button>
            <span className="text-xs text-neutral-200 w-6 text-center tabular-nums">{rows}</span>
            <button onClick={() => updateLayout({ gridRows: Math.min(12, rows + 1) })}
              className="w-6 h-6 text-xs bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400">+</button>
          </div>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Gap</span>
        <input type="range" min={0} max={40} value={node.layout.gap}
          onChange={(e) => updateLayout({ gap: parseInt(e.target.value) })}
          className="w-full accent-indigo-500" />
      </label>
    </div>
  );
}
