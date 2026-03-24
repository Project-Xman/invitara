'use client';

import { useState, useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { DeviceMode } from '~/studio/_lib/types';

const deviceIcons: Record<string, React.ReactNode> = {
  desktop: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" />
    </svg>
  ),
  tablet: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M12 18h.01" />
    </svg>
  ),
  mobile: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
    </svg>
  ),
};

function getIconForBreakpoint(id: string, width: number): React.ReactNode {
  if (deviceIcons[id]) return deviceIcons[id];
  if (width >= 1024) return deviceIcons.desktop;
  if (width >= 600) return deviceIcons.tablet;
  return deviceIcons.mobile;
}

export function DeviceSwitcher() {
  const device = useStudioStore((s) => s.device);
  const setDevice = useStudioStore((s) => s.setDevice);
  const breakpoints = useStudioStore((s) => s.breakpoints);
  const addBreakpoint = useStudioStore((s) => s.addBreakpoint);
  const removeBreakpoint = useStudioStore((s) => s.removeBreakpoint);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWidth, setNewWidth] = useState('');

  const handleAdd = useCallback(() => {
    if (newName && newWidth) {
      addBreakpoint(newName, parseInt(newWidth));
      setNewName('');
      setNewWidth('');
    }
  }, [newName, newWidth, addBreakpoint]);

  // Map breakpoint ids to DeviceMode for the 3 standard ones
  const toDeviceMode = (id: string): DeviceMode => {
    if (id === 'desktop' || id === 'tablet' || id === 'mobile') return id;
    return 'desktop'; // custom breakpoints default to desktop mode
  };

  return (
    <div className="relative flex items-center gap-1">
      <div className="flex items-center bg-neutral-800 rounded-md p-0.5">
        {breakpoints.map((bp) => (
          <button
            key={bp.id}
            onClick={() => setDevice(toDeviceMode(bp.id))}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
              device === toDeviceMode(bp.id) && (bp.id === 'desktop' || bp.id === 'tablet' || bp.id === 'mobile')
                ? 'bg-neutral-700 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title={`${bp.name} (${bp.width}px)`}
          >
            {getIconForBreakpoint(bp.id, bp.width)}
            <span className="hidden sm:inline">{bp.name}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => setEditing(!editing)}
        className="p-1 text-neutral-500 hover:text-neutral-300 text-[10px] transition-colors"
        title="Edit breakpoints"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </button>

      {editing && (
        <div className="absolute top-full right-0 mt-1 w-56 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl p-2 z-50 space-y-2">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Breakpoints</div>
          {breakpoints.map((bp) => (
            <div key={bp.id} className="flex items-center justify-between gap-1 text-[11px]">
              <span className="text-neutral-300 truncate flex-1">{bp.name}</span>
              <span className="text-neutral-500">{bp.width}px</span>
              {!['desktop', 'tablet', 'mobile'].includes(bp.id) && (
                <button onClick={() => removeBreakpoint(bp.id)} className="text-neutral-600 hover:text-red-400 ml-1">x</button>
              )}
            </div>
          ))}
          <div className="border-t border-neutral-700 pt-2 space-y-1">
            <div className="flex gap-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                className="flex-1 px-1.5 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none"
              />
              <input
                type="number"
                value={newWidth}
                onChange={(e) => setNewWidth(e.target.value)}
                placeholder="Width"
                className="w-16 px-1.5 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-200 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
            >
              Add Breakpoint
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
