'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';

export function ComponentLibrary() {
  const components = useStudioStore((s) => s.components);
  const addNode = useStudioStore((s) => s.addNode);
  const nodes = useStudioStore((s) => s.nodes);
  const updateNode = useStudioStore((s) => s.updateNode);
  const select = useStudioStore((s) => s.select);
  const selectedIds = useStudioStore((s) => s.selectedIds);
  const createComponent = useStudioStore((s) => s.createComponent);
  const entries = Object.values(components);

  const handleInsertInstance = useCallback(
    (componentId: string) => {
      const parentId = selectedIds.length === 1 && nodes[selectedIds[0]]?.type === 'frame' ? selectedIds[0] : undefined;
      const newId = addNode('component', parentId);
      updateNode(newId, {
        componentProps: { componentId, overrides: {} },
        name: `${components[componentId]?.name ?? 'Component'} Instance`,
      });
      select([newId]);
    },
    [addNode, updateNode, select, selectedIds, nodes, components]
  );

  const handleCreateFromSelected = useCallback(() => {
    if (selectedIds.length !== 1) return;
    const node = nodes[selectedIds[0]];
    if (!node || node.type !== 'frame') return;
    createComponent(selectedIds[0]);
  }, [selectedIds, nodes, createComponent]);

  return (
    <div className="p-2 space-y-2">
      {/* Create component button */}
      <button
        onClick={handleCreateFromSelected}
        disabled={selectedIds.length !== 1 || nodes[selectedIds[0]]?.type !== 'frame'}
        className="w-full py-2 text-[11px] text-indigo-400 hover:text-indigo-300 border border-dashed border-neutral-700 hover:border-indigo-500 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        + Create from Selected Frame
      </button>

      {entries.length === 0 ? (
        <div className="p-3 text-xs text-neutral-500">
          No components yet. Select a frame and click the button above.
        </div>
      ) : (
        entries.map((comp) => (
          <div
            key={comp.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 group"
          >
            <div>
              <div className="text-sm text-neutral-300">{comp.name}</div>
              {comp.description && (
                <div className="text-[11px] text-neutral-500 mt-0.5">{comp.description}</div>
              )}
            </div>
            <button
              onClick={() => handleInsertInstance(comp.id)}
              className="px-2 py-1 text-[10px] text-indigo-400 hover:text-indigo-300 bg-neutral-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Insert
            </button>
          </div>
        ))
      )}
    </div>
  );
}
