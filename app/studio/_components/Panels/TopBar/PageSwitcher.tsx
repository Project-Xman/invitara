'use client';

import { useState } from 'react';
import { useStudioStore } from '~/studio/_lib/store';

export function PageSwitcher() {
  const pages = useStudioStore((s) => s.pages);
  const activePageId = useStudioStore((s) => s.activePageId);
  const addPage = useStudioStore((s) => s.addPage);
  const setActivePage = useStudioStore((s) => s.setActivePage);
  const deletePage = useStudioStore((s) => s.deletePage);
  const renamePage = useStudioStore((s) => s.renamePage);
  const [editingId, setEditingId] = useState<string | null>(null);

  const pageList = Object.values(pages);

  return (
    <div className="flex items-center gap-1">
      {pageList.map((page) => (
        <div key={page.id} className="relative group">
          {editingId === page.id ? (
            <input
              autoFocus
              defaultValue={page.name}
              onBlur={(e) => { renamePage(page.id, e.target.value || page.name); setEditingId(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); e.stopPropagation(); }}
              className="px-2 py-1 text-[11px] bg-neutral-700 border border-indigo-500 rounded text-neutral-200 outline-none w-20"
            />
          ) : (
            <button
              onClick={() => setActivePage(page.id)}
              onDoubleClick={() => setEditingId(page.id)}
              className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                activePageId === page.id
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              {page.name}
            </button>
          )}
          {pageList.length > 1 && (
            <button
              onClick={() => deletePage(page.id)}
              className="absolute -top-1 -right-1 w-3 h-3 bg-neutral-800 text-neutral-500 hover:text-red-400 rounded-full text-[8px] leading-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              x
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => addPage()}
        className="px-1.5 py-1 text-[11px] text-neutral-500 hover:text-indigo-400 transition-colors"
        title="Add page"
      >
        +
      </button>
    </div>
  );
}
