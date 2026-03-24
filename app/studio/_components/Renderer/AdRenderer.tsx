'use client';

import React from 'react';
import type { StudioNode } from '~/studio/_lib/types';

interface AdRendererProps {
  node: StudioNode;
  children?: React.ReactNode;
}

export const AdRenderer = React.memo(function AdRenderer({ node }: AdRendererProps) {
  const ad = node.adProps;
  if (!ad) return null;

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        background: ad.gradient,
        width: typeof node.transform.size.width === 'number' ? node.transform.size.width : '100%',
        minHeight: 60,
        borderRadius: `${node.style.borderRadius[0]}px ${node.style.borderRadius[1]}px ${node.style.borderRadius[2]}px ${node.style.borderRadius[3]}px`,
        borderWidth: node.style.borderStyle !== 'none' ? node.style.borderWidth : undefined,
        borderStyle: node.style.borderStyle !== 'none' ? node.style.borderStyle : undefined,
        borderColor: node.style.borderColor,
        boxShadow: [node.style.boxShadow, node.style.innerShadow ? `inset ${node.style.innerShadow}` : ''].filter(Boolean).join(', ') || undefined,
        opacity: node.style.opacity,
        filter: node.style.filter,
      }}
      data-ad-id={node.id}
    >
      {/* Ad label */}
      <div className="absolute top-1 left-2 text-[8px] font-semibold uppercase tracking-wider text-white/40">
        Ad
      </div>

      {/* Dismiss button */}
      {ad.showDismiss && (
        <div className="absolute top-1.5 right-2 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-white/50 text-[10px]">x</span>
        </div>
      )}

      {/* Content */}
      <div className="flex items-center gap-3 p-4 pt-5 text-white">
        <span className="text-2xl shrink-0">{ad.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">{ad.adTitle}</div>
          <div className="text-[11px] opacity-70 mt-0.5 leading-snug">{ad.adDescription}</div>
        </div>
        <div className="shrink-0 px-3 py-1.5 rounded-full bg-white/20 text-[11px] font-semibold backdrop-blur-sm">
          {ad.ctaText} →
        </div>
      </div>

      {/* Slot indicator */}
      <div className="absolute bottom-1 left-2 text-[7px] text-white/30 uppercase">
        slot: {ad.slot}
      </div>
    </div>
  );
});
