'use client';

import React from 'react';
import type { StudioNode } from '~/studio/_lib/types';

interface VectorRendererProps {
  node: StudioNode;
  children?: React.ReactNode;
}

export const VectorRenderer = React.memo(function VectorRenderer({ node }: VectorRendererProps) {
  const { vectorProps, transform } = node;
  if (!vectorProps) return null;

  const w = typeof transform.size.width === 'number' ? transform.size.width : 100;
  const h = typeof transform.size.height === 'number' ? transform.size.height : 100;

  const renderShape = () => {
    const { shape, fill, stroke, strokeWidth } = vectorProps;

    switch (shape) {
      case 'ellipse':
        return <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - strokeWidth} ry={h / 2 - strokeWidth} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
      case 'line':
        return <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke={stroke} strokeWidth={strokeWidth} />;
      case 'polygon': {
        const sides = vectorProps.points ?? 6;
        const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - strokeWidth;
        const pts = Array.from({ length: sides }, (_, i) => {
          const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
      }
      case 'star': {
        const points = vectorProps.points ?? 5;
        const cx = w / 2, cy = h / 2;
        const outerR = Math.min(w, h) / 2 - strokeWidth;
        const innerR = outerR * (vectorProps.innerRadius ?? 0.4);
        const pts = Array.from({ length: points * 2 }, (_, i) => {
          const angle = (Math.PI * i) / points - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
      }
      case 'path':
        return vectorProps.pathData ? (
          <path d={vectorProps.pathData} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        ) : null;
      default: // rectangle
        return <rect x={strokeWidth / 2} y={strokeWidth / 2} width={w - strokeWidth} height={h - strokeWidth} rx={node.style.borderRadius[0]} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      data-vector-id={node.id}
      style={{
        overflow: node.style.overflow,
        opacity: node.style.opacity,
        filter: node.style.filter,
      }}
    >
      {renderShape()}
    </svg>
  );
});
