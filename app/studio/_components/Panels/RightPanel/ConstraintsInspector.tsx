'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

interface ConstraintsInspectorProps {
  node: StudioNode;
}

const H_OPTIONS = ['left', 'right', 'center', 'stretch', 'scale'] as const;
const V_OPTIONS = ['top', 'bottom', 'center', 'stretch', 'scale'] as const;

export function ConstraintsInspector({ node }: ConstraintsInspectorProps) {
  const updateNode = useStudioStore((s) => s.updateNode);

  const setConstraint = useCallback(
    (axis: 'horizontal' | 'vertical', value: string) => {
      const existing = node.constraints ?? { horizontal: 'left', vertical: 'top' };
      updateNode(node.id, {
        constraints: { ...existing, [axis]: value },
      });
    },
    [node, updateNode]
  );

  // Only show for nodes inside absolute-layout parents
  if (!node.parentId) return null;

  const constraints = node.constraints ?? { horizontal: 'left', vertical: 'top' };

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">Constraints</div>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Horizontal</span>
        <div className="flex gap-0.5">
          {H_OPTIONS.map((opt) => (
            <button key={opt} onClick={() => setConstraint('horizontal', opt)}
              className={`flex-1 px-1 py-1 text-[9px] rounded capitalize transition-colors ${
                constraints.horizontal === opt ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'
              }`}>
              {opt[0].toUpperCase()}
            </button>
          ))}
        </div>
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Vertical</span>
        <div className="flex gap-0.5">
          {V_OPTIONS.map((opt) => (
            <button key={opt} onClick={() => setConstraint('vertical', opt)}
              className={`flex-1 px-1 py-1 text-[9px] rounded capitalize transition-colors ${
                constraints.vertical === opt ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'
              }`}>
              {opt[0].toUpperCase()}
            </button>
          ))}
        </div>
      </label>
    </div>
  );
}
