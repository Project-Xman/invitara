'use client';

import { useState } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import { InsertMenu } from './InsertMenu';
import { LayerTree } from './LayerTree';
import { ComponentLibrary } from './ComponentLibrary';
import { AssetLibrary } from './AssetLibrary';
import { TokensPanel } from './TokensPanel';
import { VersionHistory } from './VersionHistory';
import { CSSVariablesPanel } from './CSSVariablesPanel';

const TABS = [
  { id: 'insert' as const, label: 'Insert' },
  { id: 'layers' as const, label: 'Layers' },
  { id: 'components' as const, label: 'Comps' },
  { id: 'assets' as const, label: 'Assets' },
  { id: 'tokens' as const, label: 'Tokens' },
  { id: 'history' as const, label: 'History' },
  { id: 'variables' as const, label: 'Vars' },
];

export function LeftPanel() {
  const activeTab = useStudioStore((s) => s.leftPanel);
  const setLeftPanel = useStudioStore((s) => s.setLeftPanel);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-60 shrink-0 border-r border-neutral-800 bg-neutral-900 flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setLeftPanel(tab.id)}
            className={`flex-1 px-2 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search - only on layers tab */}
      {activeTab === 'layers' && (
        <div className="px-2 py-1.5 border-b border-neutral-800">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search layers..."
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded text-neutral-200 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      )}

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'insert' && <InsertMenu />}
        {activeTab === 'layers' && <LayerTree searchQuery={searchQuery} />}
        {activeTab === 'components' && <ComponentLibrary />}
        {activeTab === 'assets' && <AssetLibrary />}
        {activeTab === 'tokens' && <TokensPanel />}
        {activeTab === 'history' && <VersionHistory />}
        {activeTab === 'variables' && <CSSVariablesPanel />}
      </div>
    </div>
  );
}
