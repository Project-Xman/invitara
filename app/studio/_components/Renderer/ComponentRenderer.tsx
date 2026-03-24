'use client';

import React from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';

interface ComponentRendererProps {
  node: StudioNode;
  children?: React.ReactNode;
}

export const ComponentRenderer = React.memo(function ComponentRenderer({ node, children }: ComponentRendererProps) {
  const components = useStudioStore((s) => s.components);
  const nodes = useStudioStore((s) => s.nodes);

  if (!node.componentProps) {
    // Fallback: render as frame
    return <div data-component-id={node.id}>{children}</div>;
  }

  const definition = components[node.componentProps.componentId];
  if (!definition) {
    return (
      <div className="border border-dashed border-red-400 p-2 text-xs text-red-400" data-component-id={node.id}>
        Missing component: {node.componentProps.componentId}
      </div>
    );
  }

  // Apply overrides from instance
  const overrides = node.componentProps.overrides;
  const overrideStyle: React.CSSProperties = {};
  if (overrides.backgroundColor) overrideStyle.backgroundColor = overrides.backgroundColor as string;
  if (overrides.opacity !== undefined) overrideStyle.opacity = overrides.opacity as number;
  if (overrides.width) overrideStyle.width = overrides.width as number;
  if (overrides.height) overrideStyle.height = overrides.height as number;

  const { layout, style, transform } = node;
  const css: React.CSSProperties = {
    ...overrideStyle,
  };

  if (typeof transform.size.width === 'number') css.width = css.width ?? transform.size.width;
  else if (transform.size.width === 'fill') css.width = '100%';
  if (typeof transform.size.height === 'number') css.height = css.height ?? transform.size.height;
  else if (transform.size.height === 'fill') css.height = '100%';

  if (layout.mode === 'stack') {
    css.display = 'flex';
    css.flexDirection = layout.direction === 'horizontal' ? 'row' : 'column';
    css.gap = layout.gap;
  } else if (layout.mode === 'grid') {
    css.display = 'grid';
    if (layout.gridColumns) css.gridTemplateColumns = `repeat(${layout.gridColumns}, 1fr)`;
    css.gap = layout.gap;
  }

  const [pt, pr, pb, pl] = layout.padding;
  css.padding = `${pt}px ${pr}px ${pb}px ${pl}px`;
  if (!overrideStyle.backgroundColor && style.backgroundColor) css.backgroundColor = style.backgroundColor;
  const [tl, tr, br, bl] = style.borderRadius;
  css.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
  if (style.borderWidth > 0 && style.borderStyle !== 'none') {
    css.borderWidth = style.borderWidth;
    css.borderColor = style.borderColor;
    css.borderStyle = style.borderStyle;
  }
  css.overflow = style.overflow;

  return (
    <div style={css} data-component-id={node.id}>
      {/* Component badge */}
      <div className="absolute -top-4 left-0 text-[8px] text-purple-400 bg-purple-900/50 px-1 rounded-sm pointer-events-none z-50">
        {definition.name}
      </div>
      {children}
    </div>
  );
});
