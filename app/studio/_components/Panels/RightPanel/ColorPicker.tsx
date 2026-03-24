'use client';

import { useState, useCallback, useEffect } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

const PRESET_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b', '#0ea5e9',
  '#14b8a6', '#84cc16', '#f59e0b', '#f43f5e',
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rgb, setRgb] = useState(hexToRgb(value));

  useEffect(() => {
    setRgb(hexToRgb(value));
  }, [value]);

  const handleRgbChange = useCallback(
    (channel: 'r' | 'g' | 'b', val: number) => {
      const newRgb = { ...rgb, [channel]: Math.min(255, Math.max(0, val)) };
      setRgb(newRgb);
      onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    },
    [rgb, onChange]
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-6 h-6 rounded border border-neutral-700 cursor-pointer shrink-0"
          style={{ backgroundColor: value }}
        />
        <div className="flex-1">
          <span className="text-[10px] text-neutral-500 block">{label}</span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-xs text-neutral-200 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {isOpen && (
        <div className="p-2 bg-neutral-800 rounded space-y-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 rounded cursor-pointer border-0"
          />

          {/* RGB sliders */}
          {(['r', 'g', 'b'] as const).map((ch) => (
            <label key={ch} className="flex items-center gap-2">
              <span className="text-[9px] text-neutral-500 w-3 uppercase">{ch}</span>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb[ch]}
                onChange={(e) => handleRgbChange(ch, parseInt(e.target.value))}
                className="flex-1 accent-indigo-500"
              />
              <input
                type="number"
                min={0}
                max={255}
                value={rgb[ch]}
                onChange={(e) => handleRgbChange(ch, parseInt(e.target.value) || 0)}
                className="w-10 px-1 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 text-center focus:outline-none"
              />
            </label>
          ))}

          {/* Presets */}
          <div className="flex flex-wrap gap-1 pt-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChange(c)}
                className="w-4 h-4 rounded-sm border border-neutral-600 hover:scale-125 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
