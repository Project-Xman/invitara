'use client';

import { useMemo, useRef } from 'react';
import Link from 'next/link';
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
    if (documentDirty) return 'Autosaving';
    if (!lastSavedAt) return 'Ready';
    return `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`;
  }, [documentDirty, lastSavedAt]);

  const ghostBtn =
    'px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground rounded-full border border-border/40 hover:border-primary/60 transition-all';

  return (
    <div
      className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-4"
      style={{
        background: 'oklch(var(--background) / 0.80)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
      }}
    >
      {/* Left: wordmark + history */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="font-script text-[22px] leading-none text-primary">
          Invitara
        </Link>
        <span className="h-4 w-px bg-white/10" />
        <PageSwitcher />
        <span className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            title="Undo (Cmd+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            title="Redo (Cmd+Shift+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
            </svg>
          </button>
        </div>
        <span
          className="text-[10px] uppercase text-muted-foreground/70"
          style={{ letterSpacing: '0.25em' }}
        >
          {saveLabel}
        </span>
      </div>

      {/* Center: toolbar + device + zoom */}
      <div className="flex items-center gap-3">
        <Toolbar />
        <span className="h-4 w-px bg-white/10" />
        <DeviceSwitcher />
        <ZoomControls />
      </div>

      {/* Right: file actions */}
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
          className={ghostBtn}
        >
          Export JSON
        </button>
        <button onClick={() => importRef.current?.click()} className={ghostBtn}>
          Import JSON
        </button>
        <button onClick={resetDocument} className={ghostBtn}>
          Reset
        </button>
        <button onClick={togglePreview} className={ghostBtn}>
          Preview
        </button>
        <button
          onClick={() => setExportDialogOpen(true)}
          className="rounded-full bg-primary px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-primary-foreground transition-all hover:-translate-y-px"
          style={{
            boxShadow:
              'inset 0 1px 0 oklch(1 0 0 / 0.18), 0 4px 12px -2px oklch(0 0 0 / 0.30)',
          }}
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
