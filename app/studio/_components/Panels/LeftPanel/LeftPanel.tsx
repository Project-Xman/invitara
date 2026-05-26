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
    <div className="flex w-60 shrink-0 flex-col border-r border-white/[0.06] bg-card text-foreground">
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06]">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setLeftPanel(tab.id)}
              className={
                'relative flex-1 px-2 py-2.5 text-[10px] font-medium uppercase transition-colors ' +
                (active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')
              }
              style={{ letterSpacing: '0.18em' }}
            >
              {tab.label}
              {active && (
                <span className="absolute -bottom-px left-2 right-2 h-px bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search - only on layers tab */}
      {activeTab === 'layers' && (
        <div className="border-b border-white/[0.06] px-3 py-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search layers…"
            className="w-full rounded-md border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
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
