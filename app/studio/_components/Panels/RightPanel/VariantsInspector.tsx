'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

interface VariantsInspectorProps {
  node: StudioNode;
}

const VARIANT_TYPES = ['hover', 'pressed', 'focused'] as const;

export function VariantsInspector({ node }: VariantsInspectorProps) {
  const updateNode = useStudioStore((s) => s.updateNode);

  const setVariant = useCallback(
    (variant: 'hover' | 'pressed' | 'focused', key: string, value: unknown) => {
      const existing = node.variants ?? {};
      const current = existing[variant] ?? {};
      updateNode(node.id, {
        variants: { ...existing, [variant]: { ...current, [key]: value } },
      });
    },
    [node, updateNode]
  );

  const clearVariant = useCallback(
    (variant: 'hover' | 'pressed' | 'focused') => {
      const existing = node.variants ?? {};
      const updated = { ...existing };
      delete updated[variant];
      updateNode(node.id, { variants: Object.keys(updated).length > 0 ? updated : undefined });
    },
    [node, updateNode]
  );

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">State Variants</div>

      {VARIANT_TYPES.map((variant) => {
        const data = node.variants?.[variant];
        const isActive = !!data;

        return (
          <div key={variant} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-300 capitalize">{variant}</span>
              {isActive ? (
                <button onClick={() => clearVariant(variant)} className="text-[9px] text-red-400">Remove</button>
              ) : (
                <button
                  onClick={() => setVariant(variant, 'opacity', node.style.opacity)}
                  className="text-[9px] text-indigo-400"
                >
                  + Add
                </button>
              )}
            </div>

            {isActive && (
              <div className="pl-2 space-y-1.5 border-l-2 border-neutral-700">
                <label className="flex items-center gap-2">
                  <input type="color" value={(data as any).backgroundColor ?? node.style.backgroundColor ?? '#ffffff'}
                    onChange={(e) => setVariant(variant, 'backgroundColor', e.target.value)}
                    className="w-4 h-4 rounded border border-neutral-600 cursor-pointer" />
                  <span className="text-[10px] text-neutral-500">Background</span>
                </label>
                <label className="block space-y-0.5">
                  <span className="text-[10px] text-neutral-500">Opacity</span>
                  <input type="range" min={0} max={1} step={0.05}
                    value={(data as any).opacity ?? node.style.opacity}
                    onChange={(e) => setVariant(variant, 'opacity', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500" />
                </label>
                <label className="block space-y-0.5">
                  <span className="text-[10px] text-neutral-500">Scale</span>
                  <input type="range" min={0.5} max={2} step={0.05}
                    value={(data as any).scale ?? 1}
                    onChange={(e) => setVariant(variant, 'scale', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500" />
                </label>
                <label className="block space-y-0.5">
                  <span className="text-[10px] text-neutral-500">Y Offset</span>
                  <input type="number" step={1}
                    value={(data as any).y ?? 0}
                    onChange={(e) => setVariant(variant, 'y', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-0.5 text-[10px] bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:outline-none" />
                </label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
