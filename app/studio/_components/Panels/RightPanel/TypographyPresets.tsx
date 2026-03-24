'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode, TextProps } from '~/studio/_lib/types';

interface TypographyPresetsProps {
  node: StudioNode;
}

const PRESETS: { name: string; props: Partial<TextProps> }[] = [
  { name: 'H1', props: { fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 } },
  { name: 'H2', props: { fontSize: 36, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 } },
  { name: 'H3', props: { fontSize: 28, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0 } },
  { name: 'H4', props: { fontSize: 22, fontWeight: 600, lineHeight: 1.35, letterSpacing: 0 } },
  { name: 'H5', props: { fontSize: 18, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0 } },
  { name: 'Body L', props: { fontSize: 18, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0 } },
  { name: 'Body', props: { fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 } },
  { name: 'Body S', props: { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 } },
  { name: 'Caption', props: { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.5 } },
  { name: 'Overline', props: { fontSize: 11, fontWeight: 600, lineHeight: 1.3, letterSpacing: 1.5 } },
];

export function TypographyPresets({ node }: TypographyPresetsProps) {
  const updateNode = useStudioStore((s) => s.updateNode);

  const applyPreset = useCallback(
    (preset: Partial<TextProps>) => {
      if (!node.textProps) return;
      updateNode(node.id, { textProps: { ...node.textProps, ...preset } });
    },
    [node, updateNode]
  );

  if (node.type !== 'text' || !node.textProps) return null;

  return (
    <div className="p-3 space-y-2">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">Typography Scale</div>
      <div className="grid grid-cols-2 gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset.props)}
            className={`px-2 py-1.5 text-left rounded transition-colors hover:bg-neutral-800 ${
              node.textProps?.fontSize === preset.props.fontSize && node.textProps?.fontWeight === preset.props.fontWeight
                ? 'bg-neutral-800 ring-1 ring-indigo-500'
                : 'bg-neutral-850'
            }`}
          >
            <div className="text-[11px] text-neutral-300 font-medium">{preset.name}</div>
            <div className="text-[9px] text-neutral-500">{preset.props.fontSize}px / {preset.props.fontWeight}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
