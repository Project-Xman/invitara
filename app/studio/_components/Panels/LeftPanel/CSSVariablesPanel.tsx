'use client';

import { useState, useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { CSSVariable } from '~/studio/_lib/types';

const VAR_TYPES: CSSVariable['type'][] = ['color', 'size', 'font', 'custom'];

export function CSSVariablesPanel() {
  const cssVariables = useStudioStore((s) => s.cssVariables);
  const addCSSVariable = useStudioStore((s) => s.addCSSVariable);
  const updateCSSVariable = useStudioStore((s) => s.updateCSSVariable);
  const deleteCSSVariable = useStudioStore((s) => s.deleteCSSVariable);

  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<CSSVariable['type']>('color');

  const entries = Object.values(cssVariables);

  const handleAdd = useCallback(() => {
    if (!newName.trim()) return;
    const varName = newName.startsWith('--') ? newName : `--${newName.replace(/\s+/g, '-').toLowerCase()}`;
    addCSSVariable(varName, newValue || '#000000', newType);
    setNewName('');
    setNewValue('');
  }, [newName, newValue, newType, addCSSVariable]);

  const exportCSS = useCallback(() => {
    const css = `:root {\n${entries.map((v) => `  ${v.name}: ${v.value};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css);
  }, [entries]);

  return (
    <div className="p-2 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-neutral-400 uppercase tracking-wider">CSS Variables</span>
        {entries.length > 0 && (
          <button onClick={exportCSS} className="text-[9px] text-indigo-400 hover:text-indigo-300">
            Copy CSS
          </button>
        )}
      </div>

      {/* Add new variable */}
      <div className="space-y-1.5 p-2 bg-neutral-800 rounded">
        <div className="flex gap-1">
          <span className="text-[10px] text-neutral-500 leading-[26px] shrink-0">--</span>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="variable-name"
            className="flex-1 px-1.5 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none" />
        </div>
        <div className="flex gap-1">
          <select value={newType} onChange={(e) => setNewType(e.target.value as CSSVariable['type'])}
            className="w-20 px-1 py-1 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none">
            {VAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {newType === 'color' ? (
            <input type="color" value={newValue || '#000000'} onChange={(e) => setNewValue(e.target.value)}
              className="w-7 h-7 rounded border border-neutral-600 cursor-pointer" />
          ) : (
            <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)}
              placeholder={newType === 'size' ? '16px' : newType === 'font' ? 'Inter, sans-serif' : 'value'}
              className="flex-1 px-1.5 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none" />
          )}
        </div>
        <button onClick={handleAdd} disabled={!newName.trim()}
          className="w-full py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:opacity-30 transition-colors">
          Add Variable
        </button>
      </div>

      {/* Variable list */}
      {entries.length === 0 ? (
        <p className="text-[10px] text-neutral-600 px-1">No CSS variables defined yet.</p>
      ) : (
        entries.map((v) => (
          <div key={v.id} className="flex items-center gap-1.5 px-1 group">
            {v.type === 'color' ? (
              <input type="color" value={v.value}
                onChange={(e) => updateCSSVariable(v.id, { value: e.target.value })}
                className="w-4 h-4 rounded border border-neutral-600 cursor-pointer shrink-0" />
            ) : (
              <span className="text-[8px] text-neutral-600 w-4 shrink-0 uppercase text-center">{v.type[0]}</span>
            )}
            <span className="text-[10px] text-neutral-500 font-mono truncate flex-1">{v.name}</span>
            <input
              type="text"
              value={v.value}
              onChange={(e) => updateCSSVariable(v.id, { value: e.target.value })}
              className="w-20 px-1 py-0.5 text-[10px] bg-neutral-800 border border-neutral-700 rounded text-neutral-200 focus:outline-none"
            />
            <button onClick={() => deleteCSSVariable(v.id)}
              className="text-[9px] text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100">x</button>
          </div>
        ))
      )}

      {/* Generated CSS preview */}
      {entries.length > 0 && (
        <div className="mt-2 p-2 bg-neutral-950 rounded">
          <span className="text-[9px] text-neutral-600 block mb-1">Generated CSS</span>
          <pre className="text-[9px] text-neutral-400 font-mono leading-relaxed">
            {`:root {\n${entries.map((v) => `  ${v.name}: ${v.value};`).join('\n')}\n}`}
          </pre>
        </div>
      )}
    </div>
  );
}
