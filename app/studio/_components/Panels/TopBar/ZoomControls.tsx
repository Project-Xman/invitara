'use client';

import { useStudioStore } from '~/studio/_lib/store';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP, DEVICE_SIZES } from '~/studio/_lib/constants';

export function ZoomControls() {
  const zoom = useStudioStore((s) => s.zoom);
  const setZoom = useStudioStore((s) => s.setZoom);
  const setPan = useStudioStore((s) => s.setPan);
  const device = useStudioStore((s) => s.device);

  const zoomIn = () => setZoom(Math.min(MAX_ZOOM, zoom + ZOOM_STEP));
  const zoomOut = () => setZoom(Math.max(MIN_ZOOM, zoom - ZOOM_STEP));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 100, y: 50 });
  };

  const fitToScreen = () => {
    const viewport = document.querySelector('.absolute.inset-0.overflow-hidden');
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const deviceSize = DEVICE_SIZES[device];
    const scaleX = (rect.width - 80) / deviceSize.width;
    const scaleY = (rect.height - 80) / deviceSize.height;
    const newZoom = Math.min(scaleX, scaleY, 2);
    setZoom(newZoom);
    setPan({
      x: (rect.width - deviceSize.width * newZoom) / 2,
      y: (rect.height - deviceSize.height * newZoom) / 2 + 20,
    });
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={zoomOut}
        className="p-1.5 rounded hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
        title="Zoom out"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14" />
        </svg>
      </button>
      <button
        onClick={resetZoom}
        className="min-w-[48px] px-2 py-1 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors tabular-nums"
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={zoomIn}
        className="p-1.5 rounded hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
        title="Zoom in"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14" /><path d="M5 12h14" />
        </svg>
      </button>
      <button
        onClick={fitToScreen}
        className="p-1.5 rounded hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white ml-1"
        title="Fit to screen"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      </button>
    </div>
  );
}
