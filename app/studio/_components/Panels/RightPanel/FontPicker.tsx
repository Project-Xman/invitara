'use client';

import { useMemo, useState } from 'react';
import { STUDIO_FONT_OPTIONS, ensureStudioFontLoaded } from '~/studio/_lib/utils/fonts';

interface FontPickerProps {
  value: string;
  onChange: (fontFamily: string) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const [query, setQuery] = useState('');

  const filteredFonts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return STUDIO_FONT_OPTIONS;
    return STUDIO_FONT_OPTIONS.filter((font) => font.label.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <div className="space-y-1.5">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search fonts..."
        className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
      />
      <div className="max-h-44 overflow-y-auto rounded border border-neutral-800 bg-neutral-950">
        {filteredFonts.map((font) => (
          <button
            key={font.id}
            onClick={() => {
              ensureStudioFontLoaded(font.family);
              onChange(font.family);
            }}
            className={`flex w-full items-center justify-between px-2 py-1.5 text-left text-xs transition-colors ${
              value === font.family
                ? 'bg-indigo-600/20 text-indigo-200'
                : 'text-neutral-300 hover:bg-neutral-900'
            }`}
            style={{ fontFamily: font.family }}
          >
            <span>{font.label}</span>
            <span className="text-[10px] uppercase tracking-wide text-neutral-500">{font.category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
