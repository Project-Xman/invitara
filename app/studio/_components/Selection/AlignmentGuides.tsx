'use client';

import { useMemo } from 'react';
import { useStudioStore } from '~/studio/_lib/store';

interface GuideLine {
  orientation: 'horizontal' | 'vertical';
  position: number; // px from canvas origin
}

export function AlignmentGuides() {
  const selectedIds = useStudioStore((s) => s.selectedIds);
  const nodes = useStudioStore((s) => s.nodes);
  const zoom = useStudioStore((s) => s.zoom);
  const pan = useStudioStore((s) => s.pan);

  const guides = useMemo(() => {
    if (selectedIds.length !== 1) return [];
    const selectedEl = document.querySelector(`[data-node-id="${selectedIds[0]}"]`);
    if (!selectedEl) return [];

    const selectedRect = selectedEl.getBoundingClientRect();
    const selectedCenter = {
      x: selectedRect.left + selectedRect.width / 2,
      y: selectedRect.top + selectedRect.height / 2,
    };

    const lines: GuideLine[] = [];
    const threshold = 2; // pixels

    const allNodeEls = document.querySelectorAll('[data-node-id]');
    allNodeEls.forEach((el) => {
      const id = el.getAttribute('data-node-id');
      if (id === selectedIds[0]) return;

      const rect = el.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      // Vertical center alignment
      if (Math.abs(center.x - selectedCenter.x) < threshold) {
        lines.push({ orientation: 'vertical', position: center.x });
      }
      // Horizontal center alignment
      if (Math.abs(center.y - selectedCenter.y) < threshold) {
        lines.push({ orientation: 'horizontal', position: center.y });
      }
      // Left edge alignment
      if (Math.abs(rect.left - selectedRect.left) < threshold) {
        lines.push({ orientation: 'vertical', position: rect.left });
      }
      // Right edge alignment
      if (Math.abs(rect.right - selectedRect.right) < threshold) {
        lines.push({ orientation: 'vertical', position: rect.right });
      }
      // Top edge alignment
      if (Math.abs(rect.top - selectedRect.top) < threshold) {
        lines.push({ orientation: 'horizontal', position: rect.top });
      }
      // Bottom edge alignment
      if (Math.abs(rect.bottom - selectedRect.bottom) < threshold) {
        lines.push({ orientation: 'horizontal', position: rect.bottom });
      }
    });

    return lines;
  }, [selectedIds, nodes]);

  if (guides.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[55]">
      {guides.map((guide, i) => (
        <div
          key={i}
          className={guide.orientation === 'vertical' ? 'absolute top-0 bottom-0 w-px bg-pink-500' : 'absolute left-0 right-0 h-px bg-pink-500'}
          style={
            guide.orientation === 'vertical'
              ? { left: guide.position }
              : { top: guide.position }
          }
        />
      ))}
    </div>
  );
}
