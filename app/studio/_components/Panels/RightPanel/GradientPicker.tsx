'use client';

import { useState, useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

interface GradientPickerProps {
  node: StudioNode;
}

export function GradientPicker({ node }: GradientPickerProps) {
  const updateNode = useStudioStore((s) => s.updateNode);
  const [angle, setAngle] = useState(135);
  const [color1, setColor1] = useState('#6366f1');
  const [color2, setColor2] = useState('#ec4899');
  const [isOpen, setIsOpen] = useState(false);

  const applyGradient = useCallback(() => {
    const gradient = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    updateNode(node.id, {
      style: { ...node.style, backgroundImage: gradient },
    });
  }, [node, angle, color1, color2, updateNode]);

  const clearGradient = useCallback(() => {
    updateNode(node.id, {
      style: { ...node.style, backgroundImage: undefined },
    });
  }, [node, updateNode]);

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400 uppercase tracking-wider">Gradient</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] text-indigo-400 hover:text-indigo-300"
        >
          {isOpen ? 'Close' : '+ Add'}
        </button>
      </div>

      {node.style.backgroundImage && (
        <div className="flex items-center gap-2">
          <div
            className="w-full h-6 rounded border border-neutral-700"
            style={{ background: node.style.backgroundImage }}
          />
          <button onClick={clearGradient} className="text-[10px] text-red-400 shrink-0">x</button>
        </div>
      )}

      {isOpen && (
        <div className="space-y-2 p-2 bg-neutral-800 rounded">
          <div
            className="w-full h-10 rounded"
            style={{ background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-1">
              <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-5 h-5 rounded border border-neutral-600 cursor-pointer" />
              <span className="text-[10px] text-neutral-400">Start</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-5 h-5 rounded border border-neutral-600 cursor-pointer" />
              <span className="text-[10px] text-neutral-400">End</span>
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-[10px] text-neutral-500">Angle: {angle}deg</span>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </label>
          <button
            onClick={applyGradient}
            className="w-full py-1.5 text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
          >
            Apply Gradient
          </button>
        </div>
      )}
    </div>
  );
}
