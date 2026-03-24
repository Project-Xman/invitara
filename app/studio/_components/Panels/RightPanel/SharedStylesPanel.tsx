'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

interface SharedStylesPanelProps {
  node: StudioNode;
}

export function SharedStylesPanel({ node }: SharedStylesPanelProps) {
  const sharedStyles = useStudioStore((s) => s.sharedStyles);
  const addSharedStyle = useStudioStore((s) => s.addSharedStyle);
  const deleteSharedStyle = useStudioStore((s) => s.deleteSharedStyle);
  const applySharedStyle = useStudioStore((s) => s.applySharedStyle);

  const entries = Object.values(sharedStyles);

  const saveCurrentStyle = useCallback(() => {
    addSharedStyle(`Style ${entries.length + 1}`, { ...node.style });
  }, [node.style, addSharedStyle, entries.length]);

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400 uppercase tracking-wider">Shared Styles</span>
        <button onClick={saveCurrentStyle} className="text-[10px] text-indigo-400 hover:text-indigo-300">
          Save Current
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-[10px] text-neutral-600">No saved styles. Click &quot;Save Current&quot; to create one.</p>
      ) : (
        entries.map((s) => (
          <div key={s.id} className="flex items-center gap-2 group">
            <div
              className="w-5 h-5 rounded border border-neutral-700 shrink-0"
              style={{ backgroundColor: s.style.backgroundColor ?? '#333' }}
            />
            <span className="text-[11px] text-neutral-300 flex-1 truncate">{s.name}</span>
            <button
              onClick={() => applySharedStyle(node.id, s.id)}
              className="text-[9px] text-indigo-400 opacity-0 group-hover:opacity-100"
            >
              Apply
            </button>
            <button
              onClick={() => deleteSharedStyle(s.id)}
              className="text-[9px] text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
            >
              x
            </button>
          </div>
        ))
      )}
    </div>
  );
}
