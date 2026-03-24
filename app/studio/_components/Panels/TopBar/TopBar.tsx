'use client';

import { useMemo, useRef } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import { DeviceSwitcher } from './DeviceSwitcher';
import { ZoomControls } from './ZoomControls';
import { Toolbar } from './Toolbar';
import { PageSwitcher } from './PageSwitcher';
import { isStudioDocumentV1 } from '~/studio/_lib/utils/document';

export function TopBar() {
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const past = useStudioStore((s) => s.past);
  const future = useStudioStore((s) => s.future);
  const setExportDialogOpen = useStudioStore((s) => s.setExportDialogOpen);
  const togglePreview = useStudioStore((s) => s.togglePreview);
  const exportDocument = useStudioStore((s) => s.exportDocument);
  const importDocument = useStudioStore((s) => s.importDocument);
  const resetDocument = useStudioStore((s) => s.resetDocument);
  const documentDirty = useStudioStore((s) => s.documentDirty);
  const lastSavedAt = useStudioStore((s) => s.lastSavedAt);
  const importRef = useRef<HTMLInputElement>(null);

  const saveLabel = useMemo(() => {
    if (documentDirty) return 'Autosaving...';
    if (!lastSavedAt) return 'Ready';
    return `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`;
  }, [documentDirty, lastSavedAt]);

  return (
    <div className="flex items-center justify-between h-11 px-3 border-b border-neutral-800 bg-neutral-900 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tracking-tight">Studio</span>
        <div className="w-px h-5 bg-neutral-700" />
        <PageSwitcher />
        <div className="w-px h-5 bg-neutral-700" />
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="p-1.5 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo (Cmd+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1.5 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo (Cmd+Shift+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
            </svg>
          </button>
        </div>
        <span className="text-[10px] text-neutral-500">{saveLabel}</span>
      </div>

      <div className="flex items-center gap-3">
        <Toolbar />
        <div className="w-px h-5 bg-neutral-700" />
        <DeviceSwitcher />
        <ZoomControls />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const json = JSON.stringify(exportDocument(), null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'studio-document.json';
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="px-2.5 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
        >
          Export JSON
        </button>
        <button
          onClick={() => importRef.current?.click()}
          className="px-2.5 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
        >
          Import JSON
        </button>
        <button
          onClick={resetDocument}
          className="px-2.5 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
        >
          Reset
        </button>
        <button
          onClick={togglePreview}
          className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
        >
          Preview
        </button>
        <button
          onClick={() => setExportDialogOpen(true)}
          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
        >
          Export
        </button>
        <input
          ref={importRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const text = await file.text();
            try {
              const parsed = JSON.parse(text) as unknown;
              if (!isStudioDocumentV1(parsed)) {
                throw new Error('Invalid studio document');
              }
              importDocument(parsed);
            } catch {
              window.alert('Unable to import this studio document.');
            } finally {
              event.currentTarget.value = '';
            }
          }}
        />
      </div>
    </div>
  );
}
