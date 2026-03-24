'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';
import { ColorPicker } from './ColorPicker';
import { GradientPicker } from './GradientPicker';

interface StyleInspectorProps {
  node: StudioNode;
}

export function StyleInspector({ node }: StyleInspectorProps) {
  const updateNodeStyle = useStudioStore((s) => s.updateNodeStyle);

  const updateStyle = useCallback(
    (patch: Partial<typeof node.style>) => {
      updateNodeStyle(node.id, patch);
    },
    [node, updateNodeStyle]
  );

  const { style } = node;

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">Style</div>

      {/* Background color */}
      <ColorPicker
        value={style.backgroundColor ?? '#ffffff'}
        onChange={(color) => updateStyle({ backgroundColor: color })}
        label="Background"
      />
      <GradientPicker node={node} />

      {/* Background Image */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Background Image</span>
        <input
          type="text"
          value={style.backgroundImage?.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') ?? ''}
          onChange={(e) => updateStyle({ backgroundImage: e.target.value ? `url("${e.target.value}")` : undefined })}
          placeholder="Image URL or drop file"
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        />
      </label>
      {style.backgroundImage && (
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-[9px] text-neutral-600">Size</span>
            <select
              value={style.backgroundSize ?? 'cover'}
              onChange={(e) => updateStyle({ backgroundSize: e.target.value } as any)}
              className="w-full px-1 py-0.5 text-[10px] bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:outline-none"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="auto">Auto</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[9px] text-neutral-600">Position</span>
            <select
              value={style.backgroundPosition ?? 'center'}
              onChange={(e) => updateStyle({ backgroundPosition: e.target.value } as any)}
              className="w-full px-1 py-0.5 text-[10px] bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:outline-none"
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>
        </div>
      )}

      {/* Opacity */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Opacity</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={style.opacity}
            onChange={(e) => updateStyle({ opacity: parseFloat(e.target.value) })}
            className="flex-1 accent-indigo-500"
          />
          <span className="text-[11px] text-neutral-400 w-10 text-right tabular-nums">
            {Math.round(style.opacity * 100)}%
          </span>
        </div>
      </label>

      {/* Blend Mode */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Blend Mode</span>
        <select
          value={style.mixBlendMode ?? 'normal'}
          onChange={(e) => updateStyle({ mixBlendMode: e.target.value === 'normal' ? undefined : e.target.value as any })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        >
          {['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'].map((mode) => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
      </label>

      {/* Backdrop Blur */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Backdrop Blur</span>
        <div className="flex items-center gap-2">
          <input type="range" min={0} max={50} value={style.backdropBlur ?? 0}
            onChange={(e) => updateStyle({ backdropBlur: parseInt(e.target.value) || undefined })}
            className="flex-1 accent-indigo-500" />
          <span className="text-[11px] text-neutral-400 w-8 text-right">{style.backdropBlur ?? 0}px</span>
        </div>
      </label>

      {/* CSS Filter */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">CSS Filter</span>
        <input type="text" value={style.filter ?? ''}
          onChange={(e) => updateStyle({ filter: e.target.value || undefined })}
          placeholder="brightness(1.2) contrast(1.1)"
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none" />
      </label>

      {/* Border radius */}
      <div className="space-y-1">
        <span className="text-[10px] text-neutral-500">Border Radius</span>
        <div className="grid grid-cols-4 gap-1">
          {(['TL', 'TR', 'BR', 'BL'] as const).map((label, i) => (
            <label key={label} className="space-y-0.5">
              <span className="text-[9px] text-neutral-600 block text-center">{label}</span>
              <input
                type="number"
                min={0}
                value={style.borderRadius[i]}
                onChange={(e) => {
                  const newRadius = [...style.borderRadius] as [number, number, number, number];
                  newRadius[i] = parseInt(e.target.value) || 0;
                  updateStyle({ borderRadius: newRadius });
                }}
                className="w-full px-1.5 py-1 text-[11px] bg-neutral-800 border border-neutral-700 rounded text-neutral-200 text-center focus:border-indigo-500 focus:outline-none"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Border */}
      <div className="space-y-2">
        <span className="text-[10px] text-neutral-500">Border</span>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-[9px] text-neutral-600">Width</span>
            <input
              type="number"
              min={0}
              value={style.borderWidth}
              onChange={(e) => updateStyle({ borderWidth: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 text-[11px] bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[9px] text-neutral-600">Style</span>
            <select
              value={style.borderStyle}
              onChange={(e) => updateStyle({ borderStyle: e.target.value as 'solid' | 'dashed' | 'none' })}
              className="w-full px-2 py-1 text-[11px] bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="color"
            value={style.borderColor}
            onChange={(e) => updateStyle({ borderColor: e.target.value })}
            className="w-5 h-5 rounded border border-neutral-700 bg-transparent cursor-pointer"
          />
          <span className="text-[11px] text-neutral-400">{style.borderColor}</span>
        </label>
      </div>

      {/* Box shadow */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Box Shadow</span>
        <input
          type="text"
          value={style.boxShadow}
          onChange={(e) => updateStyle({ boxShadow: e.target.value })}
          placeholder="e.g. 0 4px 6px rgba(0,0,0,0.1)"
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      {/* Inner Shadow */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Inner Shadow</span>
        <input
          type="text"
          value={style.innerShadow ?? ''}
          onChange={(e) => updateStyle({ innerShadow: e.target.value || undefined })}
          placeholder="e.g. 0 2px 4px rgba(0,0,0,0.2)"
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      {/* Overflow */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Overflow</span>
        <select
          value={style.overflow}
          onChange={(e) => updateStyle({ overflow: e.target.value as 'visible' | 'hidden' | 'scroll' })}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        >
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
          <option value="scroll">Scroll</option>
        </select>
      </label>
    </div>
  );
}
