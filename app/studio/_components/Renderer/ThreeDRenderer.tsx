'use client';

import React, { lazy, Suspense } from 'react';
import type { StudioNode } from '~/studio/_lib/types';

const SceneWrapper = lazy(() =>
  import('../ThreeD/SceneWrapper').then((mod) => ({ default: mod.SceneWrapper }))
);

interface ThreeDRendererProps {
  node: StudioNode;
  children?: React.ReactNode;
}

export const ThreeDRenderer = React.memo(function ThreeDRenderer({ node }: ThreeDRendererProps) {
  const { threeDProps, transform } = node;
  if (!threeDProps) return null;

  return (
    <div
      style={{
        width: typeof transform.size.width === 'number' ? transform.size.width : 300,
        height: typeof transform.size.height === 'number' ? transform.size.height : 300,
        borderRadius: `${node.style.borderRadius[0]}px ${node.style.borderRadius[1]}px ${node.style.borderRadius[2]}px ${node.style.borderRadius[3]}px`,
        overflow: node.style.overflow,
        backgroundColor: node.style.backgroundColor,
        borderWidth: node.style.borderStyle !== 'none' ? node.style.borderWidth : undefined,
        borderStyle: node.style.borderStyle !== 'none' ? node.style.borderStyle : undefined,
        borderColor: node.style.borderColor,
        boxShadow: [node.style.boxShadow, node.style.innerShadow ? `inset ${node.style.innerShadow}` : ''].filter(Boolean).join(', ') || undefined,
        opacity: node.style.opacity,
      }}
      data-threed-id={node.id}
    >
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-xs">
            Loading 3D...
          </div>
        }
      >
        <SceneWrapper props={threeDProps} />
      </Suspense>
    </div>
  );
});
