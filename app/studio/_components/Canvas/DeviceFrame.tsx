'use client';

import { useStudioStore } from '~/studio/_lib/store';
import { DEVICE_SIZES } from '~/studio/_lib/constants';
import { NodeRenderer } from '../Renderer/NodeRenderer';
import { DndProvider } from '../DragDrop/DndProvider';

export function DeviceFrame() {
  const device = useStudioStore((s) => s.device);
  const rootIds = useStudioStore((s) => s.pages[s.activePageId]?.rootIds ?? []);
  const { width, height } = DEVICE_SIZES[device];

  return (
    <div
      className="relative bg-white rounded-lg shadow-2xl shadow-black/50"
      style={{ width, height }}
    >
      {/* Device label */}
      <div className="absolute -top-6 left-0 text-[10px] text-neutral-500 uppercase tracking-wider">
        {device} — {width}x{height}
      </div>

      {/* Node rendering area */}
      <div className="w-full h-full overflow-hidden rounded-lg">
        {rootIds.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-300 text-sm">
            Click &quot;+&quot; in the left panel to add elements
          </div>
        ) : (
          <DndProvider>
            {rootIds.map((id) => (
              <NodeRenderer key={id} nodeId={id} />
            ))}
          </DndProvider>
        )}
      </div>
    </div>
  );
}
