'use client';

import { useState, useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { DesignToken } from '~/studio/_lib/types';

const TOKEN_TYPES: DesignToken['type'][] = ['color', 'spacing', 'fontSize', 'borderRadius'];

export function TokensPanel() {
  const tokens = useStudioStore((s) => s.tokens);
  const addToken = useStudioStore((s) => s.addToken);
  const updateToken = useStudioStore((s) => s.updateToken);
  const deleteToken = useStudioStore((s) => s.deleteToken);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<DesignToken['type']>('color');
  const [newValue, setNewValue] = useState('#6366f1');

  const entries = Object.values(tokens);

  const handleAdd = useCallback(() => {
    if (!newName.trim()) return;
    addToken(newName.trim(), newType, newValue);
    setNewName('');
  }, [newName, newType, newValue, addToken]);

  return (
    <div className="p-2 space-y-3">
      <div className="text-[11px] text-neutral-400 uppercase tracking-wider px-1">Design Tokens</div>

      {/* Add new token */}
      <div className="space-y-1.5 p-2 bg-neutral-800 rounded">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Token name"
          className="w-full px-2 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:border-indigo-500 focus:outline-none"
        />
        <div className="flex gap-1">
          <select value={newType} onChange={(e) => setNewType(e.target.value as DesignToken['type'])}
            className="flex-1 px-1 py-1 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none">
            {TOKEN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {newType === 'color' ? (
            <input type="color" value={newValue} onChange={(e) => setNewValue(e.target.value)}
              className="w-7 h-7 rounded border border-neutral-600 cursor-pointer" />
          ) : (
            <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)}
              className="flex-1 px-1 py-1 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none" />
          )}
        </div>
        <button onClick={handleAdd} disabled={!newName.trim()}
          className="w-full py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:opacity-30 transition-colors">
          Add Token
        </button>
      </div>

      {/* Token list */}
      {entries.map((token) => (
        <div key={token.id} className="flex items-center gap-2 px-1 group">
          {token.type === 'color' ? (
            <input type="color" value={token.value} onChange={(e) => updateToken(token.id, e.target.value)}
              className="w-4 h-4 rounded border border-neutral-600 cursor-pointer shrink-0" />
          ) : (
            <span className="text-[9px] text-neutral-600 w-4 shrink-0">{token.type[0].toUpperCase()}</span>
          )}
          <span className="text-[11px] text-neutral-300 flex-1 truncate">{token.name}</span>
          <span className="text-[9px] text-neutral-500 tabular-nums">{token.value}</span>
          <button onClick={() => deleteToken(token.id)}
            className="text-[9px] text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100">x</button>
        </div>
      ))}
    </div>
  );
}
