'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode, VectorProps } from '~/studio/_lib/types';

interface VectorInspectorProps {
  node: StudioNode;
}

const SHAPES = ['rectangle', 'ellipse', 'line', 'polygon', 'star', 'path'] as const;

export function VectorInspector({ node }: VectorInspectorProps) {
  const updateVectorProps = useStudioStore((s) => s.updateVectorProps);

  const updateVector = useCallback(
    (patch: Partial<VectorProps>) => {
      if (!node.vectorProps) return;
      updateVectorProps(node.id, patch);
    },
    [node, updateVectorProps]
  );

  if (node.type !== 'vector' || !node.vectorProps) return null;
  const vp = node.vectorProps;

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">Vector</div>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Shape</span>
        <select value={vp.shape} onChange={(e) => updateVector({ shape: e.target.value as VectorProps['shape'] })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none capitalize">
          {SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center gap-1">
          <input type="color" value={vp.fill} onChange={(e) => updateVector({ fill: e.target.value })} className="w-5 h-5 rounded border border-neutral-600 cursor-pointer" />
          <span className="text-[10px] text-neutral-500">Fill</span>
        </label>
        <label className="flex items-center gap-1">
          <input type="color" value={vp.stroke} onChange={(e) => updateVector({ stroke: e.target.value })} className="w-5 h-5 rounded border border-neutral-600 cursor-pointer" />
          <span className="text-[10px] text-neutral-500">Stroke</span>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Stroke Width</span>
        <input type="number" min={0} max={20} value={vp.strokeWidth}
          onChange={(e) => updateVector({ strokeWidth: parseInt(e.target.value) || 0 })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none" />
      </label>

      {(vp.shape === 'polygon' || vp.shape === 'star') && (
        <label className="block space-y-1">
          <span className="text-[10px] text-neutral-500">Points/Sides</span>
          <input type="number" min={3} max={12} value={vp.points ?? 5}
            onChange={(e) => updateVector({ points: parseInt(e.target.value) || 5 })}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none" />
        </label>
      )}

      {vp.shape === 'star' && (
        <label className="block space-y-1">
          <span className="text-[10px] text-neutral-500">Inner Radius</span>
          <input type="range" min={0.1} max={0.9} step={0.05} value={vp.innerRadius ?? 0.4}
            onChange={(e) => updateVector({ innerRadius: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500" />
        </label>
      )}

      {vp.shape === 'path' && (
        <label className="block space-y-1">
          <span className="text-[10px] text-neutral-500">Path Data (SVG d)</span>
          <textarea
            value={vp.pathData ?? ''}
            onChange={(e) => updateVector({ pathData: e.target.value })}
            rows={3}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none resize-none font-mono"
            placeholder="M 0 0 L 50 50 L 100 0"
          />
        </label>
      )}
    </div>
  );
}
