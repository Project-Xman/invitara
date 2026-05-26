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
    <div className="divide-y divide-white/[0.06]">
      <div className="p-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Multiple Selection
        </div>
        <div className="mt-2 font-display italic text-lg font-light text-foreground">
          {selectedNodes.length} elements
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground/70">
          {Array.from(new Set(selectedNodes.map((n) => n.type))).join(', ')}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Shared Properties
        </div>

        <ColorPicker
          value={selectedNodes[0]?.style.backgroundColor ?? '#ffffff'}
          onChange={setAllBackground}
          label="Background (all)"
        />

        <label className="block space-y-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Opacity (all)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={selectedNodes[0]?.style.opacity ?? 1}
              onChange={(e) => setAllOpacity(parseFloat(e.target.value))}
              className="flex-1 accent-[oklch(0.84_0.10_88)]"
            />
            <span className="w-10 text-right text-[11px] tabular-nums text-muted-foreground">
              {Math.round((selectedNodes[0]?.style.opacity ?? 1) * 100)}%
            </span>
          </div>
        </label>
      </div>

      <div className="space-y-2 p-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Actions</div>
        <div className="flex gap-2">
          <button
            onClick={() => setAllVisibility(true)}
            className="flex-1 rounded-full border border-border/40 py-1.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
          >
            Show All
          </button>
          <button
            onClick={() => setAllVisibility(false)}
            className="flex-1 rounded-full border border-border/40 py-1.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
          >
            Hide All
          </button>
        </div>
        <button
          onClick={() => deleteNodes([...selectedIds])}
          className="w-full rounded-full border border-destructive/30 py-1.5 text-[10px] uppercase tracking-[0.15em] text-destructive transition-colors hover:bg-destructive/10"
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
  const multiSelected =
    selectedIds.length > 1
      ? (selectedIds.map((id) => nodes[id]).filter(Boolean) as StudioNode[])
      : [];

  return (
    <div className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-white/[0.06] bg-card text-foreground">
      {selectedIds.length === 0 ? (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Select an element to inspect
          </p>
        </div>
      ) : multiSelected.length > 1 ? (
        <MultiNodeInspector nodes={multiSelected} />
      ) : selectedNode ? (
        <div className="divide-y divide-white/[0.06]">
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Element
            </div>
            <input
              value={selectedNode.name}
              onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
              className="mt-2 w-full border-b border-transparent bg-transparent py-0.5 font-display italic text-base font-light text-foreground hover:border-border/40 focus:border-primary/60 focus:outline-none"
            />
            <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
              {selectedNode.type}
            </div>
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
