'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

interface InteractionsInspectorProps {
  node: StudioNode;
}

export function InteractionsInspector({ node }: InteractionsInspectorProps) {
  const updateNode = useStudioStore((s) => s.updateNode);
  const pages = useStudioStore((s) => s.pages);

  const addInteraction = useCallback(() => {
    const interactions = node.interactions ?? [];
    updateNode(node.id, {
      interactions: [...interactions, { trigger: 'click', action: 'navigate', targetPageId: Object.keys(pages)[0] }],
    });
  }, [node, updateNode, pages]);

  const updateInteraction = useCallback(
    (index: number, patch: Record<string, unknown>) => {
      const interactions = [...(node.interactions ?? [])];
      interactions[index] = { ...interactions[index], ...patch } as any;
      updateNode(node.id, { interactions });
    },
    [node, updateNode]
  );

  const removeInteraction = useCallback(
    (index: number) => {
      const interactions = (node.interactions ?? []).filter((_, i) => i !== index);
      updateNode(node.id, { interactions: interactions.length > 0 ? interactions : undefined });
    },
    [node, updateNode]
  );

  const pageList = Object.values(pages);

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400 uppercase tracking-wider">Interactions</span>
        <button onClick={addInteraction} className="text-[10px] text-indigo-400 hover:text-indigo-300">+ Add</button>
      </div>

      {(node.interactions ?? []).map((interaction, i) => (
        <div key={i} className="p-2 bg-neutral-800 rounded space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500">#{i + 1}</span>
            <button onClick={() => removeInteraction(i)} className="text-[9px] text-neutral-600 hover:text-red-400">x</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <label className="space-y-0.5">
              <span className="text-[9px] text-neutral-600">Trigger</span>
              <select value={interaction.trigger} onChange={(e) => updateInteraction(i, { trigger: e.target.value })}
                className="w-full px-1.5 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none">
                <option value="click">Click</option>
                <option value="hover">Hover</option>
              </select>
            </label>
            <label className="space-y-0.5">
              <span className="text-[9px] text-neutral-600">Action</span>
              <select value={interaction.action} onChange={(e) => updateInteraction(i, { action: e.target.value })}
                className="w-full px-1.5 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none">
                <option value="navigate">Go to Page</option>
                <option value="openUrl">Open URL</option>
                <option value="scrollTo">Scroll to</option>
              </select>
            </label>
          </div>
          {interaction.action === 'navigate' && (
            <select value={interaction.targetPageId ?? ''} onChange={(e) => updateInteraction(i, { targetPageId: e.target.value })}
              className="w-full px-1.5 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none">
              {pageList.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {interaction.action === 'openUrl' && (
            <input type="text" value={interaction.url ?? ''} onChange={(e) => updateInteraction(i, { url: e.target.value })}
              placeholder="https://..." className="w-full px-1.5 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none" />
          )}
        </div>
      ))}
    </div>
  );
}
