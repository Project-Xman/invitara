'use client';

import React from 'react';
import type { StudioNode } from '~/studio/_lib/types';

interface ImageRendererProps {
  node: StudioNode;
  children?: React.ReactNode;
}

export const ImageRenderer = React.memo(function ImageRenderer({
  node,
}: ImageRendererProps) {
  const { imageProps, transform, style: nodeStyle } = node;
  if (!imageProps) return null;

  const containerStyle: React.CSSProperties = {
    width: typeof transform.size.width === 'number' ? transform.size.width : undefined,
    height: typeof transform.size.height === 'number' ? transform.size.height : undefined,
    overflow: nodeStyle.overflow,
    borderRadius: `${nodeStyle.borderRadius[0]}px ${nodeStyle.borderRadius[1]}px ${nodeStyle.borderRadius[2]}px ${nodeStyle.borderRadius[3]}px`,
    backgroundColor: nodeStyle.backgroundColor,
    borderWidth: nodeStyle.borderStyle !== 'none' ? nodeStyle.borderWidth : undefined,
    borderStyle: nodeStyle.borderStyle !== 'none' ? nodeStyle.borderStyle : undefined,
    borderColor: nodeStyle.borderColor,
    boxShadow: [nodeStyle.boxShadow, nodeStyle.innerShadow ? `inset ${nodeStyle.innerShadow}` : ''].filter(Boolean).join(', ') || undefined,
    opacity: nodeStyle.opacity,
    filter: nodeStyle.filter,
    backdropFilter: nodeStyle.backdropBlur ? `blur(${nodeStyle.backdropBlur}px)` : undefined,
  };

  if (!imageProps.src) {
    return (
      <div
        style={containerStyle}
        className="flex items-center justify-center bg-neutral-100 text-neutral-400"
        data-image-id={node.id}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div style={containerStyle} data-image-id={node.id}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageProps.src}
        alt={imageProps.alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: imageProps.objectFit,
          display: 'block',
        }}
      />
    </div>
  );
});
