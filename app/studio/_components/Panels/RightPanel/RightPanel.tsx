'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';
import { LayoutInspector } from './LayoutInspector';
import { StyleInspector } from './StyleInspector';
import { TransformInspector } from './TransformInspector';
import { TextInspector } from './TextInspector';
import { ImageInspector } from './ImageInspector';
import { AnimationInspector } from './AnimationInspector';
import { ThreeDInspector } from './ThreeDInspector';
import { ResponsiveInspector } from './ResponsiveInspector';
import { VectorInspector } from './VectorInspector';
import { AdInspector } from './AdInspector';
import { ConstraintsInspector } from './ConstraintsInspector';
import { ComponentOverrideInspector } from './ComponentOverrideInspector';
import { VariantsInspector } from './VariantsInspector';
import { InteractionsInspector } from './InteractionsInspector';
import { ColorPicker } from './ColorPicker';
import { SharedStylesPanel } from './SharedStylesPanel';
import { GridEditor } from './GridEditor';
import { TypographyPresets } from './TypographyPresets';

function MultiNodeInspector({ nodes: selectedNodes }: { nodes: StudioNode[] }) {
  const updateNode = useStudioStore((s) => s.updateNode);
  const deleteNodes = useStudioStore((s) => s.deleteNodes);
  const selectedIds = useStudioStore((s) => s.selectedIds);

  const setAllOpacity = useCallback(
    (opacity: number) => {
      for (const node of selectedNodes) {
        updateNode(node.id, { style: { ...node.style, opacity } });
      }
    },
    [selectedNodes, updateNode]
  );

  const setAllVisibility = useCallback(
    (visible: boolean) => {
      for (const node of selectedNodes) {
        updateNode(node.id, { visible });
      }
    },
    [selectedNodes, updateNode]
  );

  const setAllBackground = useCallback(
    (backgroundColor: string) => {
      for (const node of selectedNodes) {
        updateNode(node.id, { style: { ...node.style, backgroundColor } });
      }
    },
    [selectedNodes, updateNode]
  );

  return (
    <div className="divide-y divide-neutral-800">
      <div className="p-3">
        <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Multiple Selection</div>
        <div className="text-sm font-medium text-neutral-200">{selectedNodes.length} elements</div>
        <div className="text-[11px] text-neutral-500 mt-0.5">
          {Array.from(new Set(selectedNodes.map((n) => n.type))).join(', ')}
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className="text-xs text-neutral-400 uppercase tracking-wider">Shared Properties</div>

        <ColorPicker
          value={selectedNodes[0]?.style.backgroundColor ?? '#ffffff'}
          onChange={setAllBackground}
          label="Background (all)"
        />

        <label className="block space-y-1">
          <span className="text-[10px] text-neutral-500">Opacity (all)</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={selectedNodes[0]?.style.opacity ?? 1}
              onChange={(e) => setAllOpacity(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-[11px] text-neutral-400 w-10 text-right tabular-nums">
              {Math.round((selectedNodes[0]?.style.opacity ?? 1) * 100)}%
            </span>
          </div>
        </label>
      </div>

      <div className="p-3 space-y-2">
        <div className="text-xs text-neutral-400 uppercase tracking-wider">Actions</div>
        <div className="flex gap-2">
          <button
            onClick={() => setAllVisibility(true)}
            className="flex-1 py-1.5 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
          >
            Show All
          </button>
          <button
            onClick={() => setAllVisibility(false)}
            className="flex-1 py-1.5 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
          >
            Hide All
          </button>
        </div>
        <button
          onClick={() => deleteNodes([...selectedIds])}
          className="w-full py-1.5 text-[11px] bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors"
        >
          Delete {selectedNodes.length} elements
        </button>
      </div>
    </div>
  );
}

export function RightPanel() {
  const selectedIds = useStudioStore((s) => s.selectedIds);
  const nodes = useStudioStore((s) => s.nodes);
  const rightPanelOpen = useStudioStore((s) => s.rightPanelOpen);
  const updateNode = useStudioStore((s) => s.updateNode);

  if (!rightPanelOpen) return null;

  const selectedNode = selectedIds.length === 1 ? nodes[selectedIds[0]] : null;
  const multiSelected = selectedIds.length > 1 ? selectedIds.map((id) => nodes[id]).filter(Boolean) as StudioNode[] : [];

  return (
    <div className="w-72 shrink-0 border-l border-neutral-800 bg-neutral-900 flex flex-col overflow-y-auto">
      {selectedIds.length === 0 ? (
        <div className="flex items-center justify-center h-full text-xs text-neutral-500">
          Select an element to inspect
        </div>
      ) : multiSelected.length > 1 ? (
        <MultiNodeInspector nodes={multiSelected} />
      ) : selectedNode ? (
        <div className="divide-y divide-neutral-800">
          <div className="p-3">
            <div className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Element</div>
            <input
              value={selectedNode.name}
              onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
              className="w-full text-sm font-medium text-neutral-200 bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-indigo-500 focus:outline-none py-0.5"
            />
            <div className="text-[11px] text-neutral-500 capitalize mt-0.5">{selectedNode.type}</div>
          </div>

          <TransformInspector node={selectedNode} />
          <TypographyPresets node={selectedNode} />
          <TextInspector node={selectedNode} />
          <ImageInspector node={selectedNode} />
          <LayoutInspector node={selectedNode} />
          <GridEditor node={selectedNode} />
          <StyleInspector node={selectedNode} />
          <SharedStylesPanel node={selectedNode} />
          <AnimationInspector node={selectedNode} />
          <VariantsInspector node={selectedNode} />
          <InteractionsInspector node={selectedNode} />
          <ThreeDInspector node={selectedNode} />
          <VectorInspector node={selectedNode} />
          <AdInspector node={selectedNode} />
          <ResponsiveInspector node={selectedNode} />
          <ConstraintsInspector node={selectedNode} />
          <ComponentOverrideInspector node={selectedNode} />
        </div>
      ) : null}
    </div>
  );
}
