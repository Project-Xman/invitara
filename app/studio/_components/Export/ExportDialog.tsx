'use client';

import { useMemo, useState, useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import { generateReactCode } from '~/studio/_lib/utils/code-generator';

export function ExportDialog() {
  const isOpen = useStudioStore((s) => s.exportDialogOpen);
  const setOpen = useStudioStore((s) => s.setExportDialogOpen);
  const nodes = useStudioStore((s) => s.nodes);
  const rootIds = useStudioStore((s) => s.pages[s.activePageId]?.rootIds ?? []);
  const [copied, setCopied] = useState(false);
  const [styleMode, setStyleMode] = useState<'tailwind' | 'inline'>('tailwind');
  const [includeAnimations, setIncludeAnimations] = useState(true);

  const code = useMemo(() => {
    if (!isOpen) return '';
    return generateReactCode(nodes, rootIds, { styleMode, includeAnimations });
  }, [isOpen, nodes, rootIds, styleMode, includeAnimations]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedComponent.tsx';
    a.click();
    URL.revokeObjectURL(url);
  }, [code]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

      <div className="relative bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl w-[700px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-200">Export React Code</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Options bar */}
        <div className="flex items-center gap-4 px-5 py-2 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 uppercase">Style:</span>
            <div className="flex bg-neutral-800 rounded p-0.5">
              <button
                onClick={() => setStyleMode('tailwind')}
                className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                  styleMode === 'tailwind' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Tailwind
              </button>
              <button
                onClick={() => setStyleMode('inline')}
                className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                  styleMode === 'inline' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Inline
              </button>
            </div>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAnimations}
              onChange={() => setIncludeAnimations(!includeAnimations)}
              className="rounded border-neutral-600 bg-neutral-800 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-neutral-400">Include Animations</span>
          </label>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <pre className="text-xs leading-relaxed font-mono text-neutral-300 bg-neutral-950 rounded-lg p-4 overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-800">
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
          >
            Download .tsx
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors min-w-[100px]"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
