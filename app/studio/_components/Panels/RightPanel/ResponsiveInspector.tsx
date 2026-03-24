'use client';

import { useCallback } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode, DeviceMode } from '~/studio/_lib/types';

interface ResponsiveInspectorProps {
  node: StudioNode;
}

export function ResponsiveInspector({ node }: ResponsiveInspectorProps) {
  const updateResponsiveProps = useStudioStore((s) => s.updateResponsiveProps);
  const clearResponsiveProps = useStudioStore((s) => s.clearResponsiveProps);
  const device = useStudioStore((s) => s.device);

  const currentOverrides = device === 'tablet' ? node.responsive.tablet : device === 'mobile' ? node.responsive.mobile : null;

  const setOverride = useCallback(
    (key: string, value: unknown) => {
      if (device === 'desktop') return;
      const deviceKey = device as 'tablet' | 'mobile';
      const existing = node.responsive[deviceKey] || {};
      updateResponsiveProps(node.id, deviceKey, { ...existing, [key]: value } as any);
    },
    [node, device, updateResponsiveProps]
  );

  const clearOverrides = useCallback(() => {
    if (device === 'desktop') return;
    const deviceKey = device as 'tablet' | 'mobile';
    clearResponsiveProps(node.id, deviceKey);
  }, [node.id, device, clearResponsiveProps]);

  if (device === 'desktop') {
    return (
      <div className="p-3">
        <div className="text-xs text-neutral-400 uppercase tracking-wider">Responsive</div>
        <p className="text-[11px] text-neutral-500 mt-1">Switch to tablet or mobile to add responsive overrides.</p>
      </div>
    );
  }

  const widthOverride = (currentOverrides as any)?.size?.width;
  const heightOverride = (currentOverrides as any)?.size?.height;
  const bgOverride = (currentOverrides as any)?.backgroundColor;
  const opacityOverride = (currentOverrides as any)?.opacity;
  const gapOverride = (currentOverrides as any)?.gap;

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400 uppercase tracking-wider">
          {device} Overrides
        </span>
        {currentOverrides && (
          <button onClick={clearOverrides} className="text-[10px] text-red-400 hover:text-red-300">
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Width</span>
          <input
            type="text"
            value={widthOverride ?? ''}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setOverride('size', { ...(currentOverrides as any)?.size, width: isNaN(v) ? 'auto' : v });
            }}
            placeholder="inherit"
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-amber-700/50 rounded text-neutral-200 focus:border-amber-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] text-neutral-500">Height</span>
          <input
            type="text"
            value={heightOverride ?? ''}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setOverride('size', { ...(currentOverrides as any)?.size, height: isNaN(v) ? 'auto' : v });
            }}
            placeholder="inherit"
            className="w-full px-2 py-1 text-xs bg-neutral-800 border border-amber-700/50 rounded text-neutral-200 focus:border-amber-500 focus:outline-none"
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Gap</span>
        <input
          type="number"
          min={0}
          value={gapOverride ?? ''}
          onChange={(e) => setOverride('gap', parseInt(e.target.value) || 0)}
          placeholder="inherit"
          className="w-full px-2 py-1 text-xs bg-neutral-800 border border-amber-700/50 rounded text-neutral-200 focus:border-amber-500 focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="color"
          value={bgOverride ?? node.style.backgroundColor ?? '#ffffff'}
          onChange={(e) => setOverride('backgroundColor', e.target.value)}
          className="w-6 h-6 rounded border border-neutral-700 bg-transparent cursor-pointer"
        />
        <span className="text-[10px] text-neutral-500">Background Override</span>
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] text-neutral-500">Opacity</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={opacityOverride ?? node.style.opacity}
          onChange={(e) => setOverride('opacity', parseFloat(e.target.value))}
          className="w-full accent-amber-500"
        />
      </label>

      <p className="text-[9px] text-amber-600">
        Amber borders indicate responsive overrides for {device} mode.
      </p>
    </div>
  );
}
