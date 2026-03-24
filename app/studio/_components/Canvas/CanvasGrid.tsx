'use client';

import { GRID_SIZE } from '~/studio/_lib/constants';

interface CanvasGridProps {
  zoom: number;
  pan: { x: number; y: number };
}

export function CanvasGrid({ zoom, pan }: CanvasGridProps) {
  const scaledSize = GRID_SIZE * zoom;
  const offsetX = pan.x % scaledSize;
  const offsetY = pan.y % scaledSize;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <pattern
          id="studio-grid"
          x={offsetX}
          y={offsetY}
          width={scaledSize}
          height={scaledSize}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={scaledSize / 2}
            cy={scaledSize / 2}
            r={1}
            fill="rgba(255,255,255,0.08)"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#studio-grid)" />
    </svg>
  );
}
