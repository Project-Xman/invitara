'use client';

import { useState, useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';

interface Snapshot {
  label: string;
  timestamp: number;
  document: any;
}

export function VersionHistory() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const past = useStudioStore((s) => s.past);
  const exportDocument = useStudioStore((s) => s.exportDocument);
  const importDocument = useStudioStore((s) => s.importDocument);

  const saveSnapshot = useCallback(() => {
    setSnapshots((prev) => [
      ...prev,
      {
        label: `Snapshot ${prev.length + 1}`,
        timestamp: Date.now(),
        document: exportDocument(),
      },
    ]);
  }, [exportDocument]);

  const restoreSnapshot = useCallback(
    (snapshot: Snapshot) => {
      useStudioStore.getState().pushHistory();
      importDocument(snapshot.document);
    },
    [importDocument]
  );

  const deleteSnapshot = useCallback((index: number) => {
    setSnapshots((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-neutral-400 uppercase tracking-wider">Versions</span>
        <span className="text-[9px] text-neutral-600">{past.length} undo steps</span>
      </div>

      <button onClick={saveSnapshot}
        className="w-full py-2 text-[11px] text-indigo-400 hover:text-indigo-300 border border-dashed border-neutral-700 hover:border-indigo-500 rounded-lg transition-colors">
        Save Snapshot
      </button>

      {snapshots.length === 0 ? (
        <p className="text-[10px] text-neutral-600 px-1">No snapshots saved yet.</p>
      ) : (
        snapshots.map((snap, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-neutral-800 rounded group">
            <div className="flex-1">
              <div className="text-[11px] text-neutral-300">{snap.label}</div>
              <div className="text-[9px] text-neutral-600">
                {new Date(snap.timestamp).toLocaleTimeString()}
              </div>
            </div>
            <button onClick={() => restoreSnapshot(snap)}
              className="text-[9px] text-indigo-400 opacity-0 group-hover:opacity-100">Restore</button>
            <button onClick={() => deleteSnapshot(i)}
              className="text-[9px] text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100">x</button>
          </div>
        ))
      )}
    </div>
  );
}
