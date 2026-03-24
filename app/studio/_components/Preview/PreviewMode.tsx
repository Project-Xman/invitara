'use client';

import { useStudioStore } from '~/studio/_lib/store';
import { DEVICE_SIZES } from '~/studio/_lib/constants';
import { NodeRenderer } from '../Renderer/NodeRenderer';

export function PreviewMode() {
  const device = useStudioStore((s) => s.device);
  const rootIds = useStudioStore((s) => s.pages[s.activePageId]?.rootIds ?? []);
  const togglePreview = useStudioStore((s) => s.togglePreview);
  const { width, height } = DEVICE_SIZES[device];

  return (
    <div className="absolute inset-0 z-[90] bg-neutral-950 flex flex-col">
      {/* Preview topbar */}
      <div className="flex items-center justify-between h-10 px-4 border-b border-neutral-800 bg-neutral-900 shrink-0">
        <span className="text-xs text-neutral-400">Preview Mode — {device}</span>
        <button
          onClick={togglePreview}
          className="px-3 py-1 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
        >
          Exit Preview
        </button>
      </div>

      {/* Preview content centered */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-8">
        <div
          className="bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{ width, minHeight: height }}
        >
          {rootIds.map((id) => (
            <NodeRenderer key={id} nodeId={id} />
          ))}
        </div>
      </div>
    </div>
  );
}
