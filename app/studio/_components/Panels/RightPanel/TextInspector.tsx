'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode, TextProps } from '~/studio/_lib/types';
import { FontPicker } from './FontPicker';

const FONT_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

interface TextInspectorProps {
  node: StudioNode;
}

export function TextInspector({ node }: TextInspectorProps) {
  const updateTextProps = useStudioStore((s) => s.updateTextProps);

  const updateText = useCallback(
    (patch: Partial<TextProps>) => {
      if (!node.textProps) return;
      updateTextProps(node.id, patch);
    },
    [node, updateTextProps]
  );

  if (node.type !== 'text' || !node.textProps) return null;

  const tp = node.textProps;

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wider">Typography</div>

      {/* Font family */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Font Family</span>
        <FontPicker value={tp.fontFamily} onChange={(fontFamily) => updateText({ fontFamily })} />
      </label>

      {/* Size and Weight */}
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Size</span>
          <input
            type="number"
            min={8}
            max={200}
            value={tp.fontSize}
            onChange={(e) => updateText({ fontSize: parseInt(e.target.value) || 16 })}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Weight</span>
          <select
            value={tp.fontWeight}
            onChange={(e) => updateText({ fontWeight: parseInt(e.target.value) })}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          >
            {FONT_WEIGHTS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Line height and Letter spacing */}
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Line Height</span>
          <input
            type="number"
            step={0.1}
            min={0.5}
            max={4}
            value={tp.lineHeight}
            onChange={(e) => updateText({ lineHeight: parseFloat(e.target.value) || 1.5 })}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Spacing</span>
          <input
            type="number"
            step={0.5}
            value={tp.letterSpacing}
            onChange={(e) => updateText({ letterSpacing: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
          />
        </label>
      </div>

      {/* Color */}
      <label className="flex items-center gap-2">
        <input
          type="color"
          value={tp.color}
          onChange={(e) => updateText({ color: e.target.value })}
          className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
        />
        <div className="flex-1">
          <span className="text-[10px] text-neutral-500 block">Color</span>
          <input
            type="text"
            value={tp.color}
            onChange={(e) => updateText({ color: e.target.value })}
            className="w-full text-xs text-neutral-200 bg-transparent focus:outline-none"
          />
        </div>
      </label>

      {/* Text Gradient */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Text Gradient</span>
        <input type="text" value={tp.gradient ?? ''}
          onChange={(e) => updateText({ gradient: e.target.value || undefined })}
          placeholder="linear-gradient(90deg, #6366f1, #ec4899)"
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none" />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Text Shadow</span>
        <input
          type="text"
          value={tp.textShadow ?? ''}
          onChange={(e) => updateText({ textShadow: e.target.value || undefined })}
          placeholder="0 2px 12px rgba(0,0,0,0.18)"
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      {/* Text align */}
      <div className="space-y-1">
        <span className="text-[10px] text-neutral-500">Alignment</span>
        <div className="flex gap-1">
          {(['left', 'center', 'right', 'justify'] as const).map((align) => (
            <button
              key={align}
              onClick={() => updateText({ textAlign: align })}
              className={`flex-1 px-2 py-1 text-[11px] rounded capitalize transition-colors ${
                tp.textAlign === align
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {align[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Text decoration */}
      <div className="space-y-1">
        <span className="text-[10px] text-neutral-500">Decoration</span>
        <div className="flex gap-1">
          {(['none', 'underline', 'line-through'] as const).map((dec) => (
            <button
              key={dec}
              onClick={() => updateText({ textDecoration: dec })}
              className={`flex-1 px-2 py-1 text-[11px] rounded capitalize transition-colors ${
                tp.textDecoration === dec
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {dec === 'none' ? 'None' : dec === 'underline' ? 'U' : 'S'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Content</span>
        <textarea
          value={tp.content}
          onChange={(e) => updateText({ content: e.target.value })}
          rows={3}
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none resize-none"
        />
      </label>
    </div>
  );
}
