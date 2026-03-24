'use client';

import React from 'react';
import { useStudioStore } from '~/studio/_lib/store';

export function CanvasRulers() {
  const zoom = useStudioStore((s) => s.zoom);
  const pan = useStudioStore((s) => s.pan);

  const step = zoom < 0.5 ? 100 : zoom < 1 ? 50 : zoom < 2 ? 25 : 10;
  const scaledStep = step * zoom;

  const renderHorizontalMarks = () => {
    const marks: React.ReactNode[] = [];
    const startPx = pan.x % scaledStep;
    const startVal = -Math.floor(pan.x / scaledStep) * step;
    for (let i = 0; i < 100; i++) {
      const px = startPx + i * scaledStep;
      const val = startVal + i * step;
      marks.push(
        <div key={i} className="absolute top-0 text-[8px] text-neutral-600" style={{ left: px }}>
          <div className="h-2 w-px bg-neutral-700" />
          {i % 2 === 0 && <span className="ml-0.5">{val}</span>}
        </div>
      );
    }
    return marks;
  };

  const renderVerticalMarks = () => {
    const marks: React.ReactNode[] = [];
    const startPx = pan.y % scaledStep;
    const startVal = -Math.floor(pan.y / scaledStep) * step;
    for (let i = 0; i < 60; i++) {
      const px = startPx + i * scaledStep;
      const val = startVal + i * step;
      marks.push(
        <div key={i} className="absolute left-0 text-[8px] text-neutral-600" style={{ top: px }}>
          <div className="w-2 h-px bg-neutral-700" />
          {i % 2 === 0 && (
            <span className="ml-0.5 block" style={{ writingMode: 'vertical-lr', fontSize: 8 }}>{val}</span>
          )}
        </div>
      );
    }
    return marks;
  };

  return (
    <>
      {/* Horizontal ruler */}
      <div className="absolute top-0 left-5 right-0 h-5 bg-neutral-900/80 border-b border-neutral-800 overflow-hidden z-10 pointer-events-none">
        {renderHorizontalMarks()}
      </div>
      {/* Vertical ruler */}
      <div className="absolute top-5 left-0 bottom-0 w-5 bg-neutral-900/80 border-r border-neutral-800 overflow-hidden z-10 pointer-events-none">
        {renderVerticalMarks()}
      </div>
      {/* Corner */}
      <div className="absolute top-0 left-0 w-5 h-5 bg-neutral-900 border-b border-r border-neutral-800 z-10" />
    </>
  );
}
