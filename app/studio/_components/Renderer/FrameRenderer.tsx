'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { StudioNode, AnimationProps } from '~/studio/_lib/types';

interface FrameRendererProps {
  node: StudioNode;
  children?: React.ReactNode;
}

function getLayoutStyles(node: StudioNode): React.CSSProperties {
  const { layout, style, transform } = node;
  const css: React.CSSProperties = {};

  if (typeof transform.size.width === 'number') css.width = transform.size.width;
  else if (transform.size.width === 'fill') css.width = '100%';
  if (typeof transform.size.height === 'number') css.height = transform.size.height;
  else if (transform.size.height === 'fill') css.height = '100%';

  if (layout.mode === 'stack') {
    css.display = 'flex';
    css.flexDirection = layout.direction === 'horizontal' ? 'row' : 'column';
    css.gap = layout.gap;
    css.alignItems = layout.alignItems === 'space-between' ? 'stretch' : layout.alignItems;
    css.justifyContent = layout.justifyContent;
    if (layout.wrap) css.flexWrap = 'wrap';
  } else if (layout.mode === 'grid') {
    css.display = 'grid';
    if (layout.gridColumns) css.gridTemplateColumns = `repeat(${layout.gridColumns}, 1fr)`;
    if (layout.gridRows) css.gridTemplateRows = `repeat(${layout.gridRows}, 1fr)`;
    css.gap = layout.gap;
    css.alignItems = layout.alignItems === 'space-between' ? 'stretch' : layout.alignItems;
    css.justifyContent = layout.justifyContent;
  } else {
    css.position = 'relative';
  }

  const [pt, pr, pb, pl] = layout.padding;
  css.padding = `${pt}px ${pr}px ${pb}px ${pl}px`;
  if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
  if (style.backgroundImage) css.backgroundImage = style.backgroundImage;
  if (style.backgroundSize) css.backgroundSize = style.backgroundSize;
  if (style.backgroundPosition) css.backgroundPosition = style.backgroundPosition;
  const [tl, tr, br, bl] = style.borderRadius;
  css.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
  if (style.borderWidth > 0 && style.borderStyle !== 'none') {
    css.borderWidth = style.borderWidth;
    css.borderColor = style.borderColor;
    css.borderStyle = style.borderStyle;
  }
  const shadows = [style.boxShadow, style.innerShadow ? `inset ${style.innerShadow}` : ''].filter(Boolean).join(', ');
  if (shadows) css.boxShadow = shadows;
  if (style.opacity < 1) css.opacity = style.opacity;
  if (style.mixBlendMode) css.mixBlendMode = style.mixBlendMode;
  if (style.backdropBlur) css.backdropFilter = `blur(${style.backdropBlur}px)`;
  if (style.filter) css.filter = style.filter;
  css.overflow = style.overflow;

  return css;
}

function buildMotionProps(animation: AnimationProps) {
  const initial: Record<string, number> = {};
  const animate: Record<string, number> = {};
  let maxDuration = 0;
  let maxDelay = 0;

  for (const kf of animation.keyframes) {
    initial[kf.property] = kf.from;
    animate[kf.property] = kf.to;
    maxDuration = Math.max(maxDuration, kf.duration);
    maxDelay = Math.max(maxDelay, kf.delay);
  }

  const transition: Record<string, unknown> = {
    duration: maxDuration,
    ease: animation.keyframes[0]?.ease ?? 'easeInOut',
  };
  if (maxDelay > 0) transition.delay = maxDelay;
  if (animation.loop) {
    transition.repeat = Infinity;
    transition.repeatType = 'reverse';
  }

  if (animation.trigger === 'onHover') {
    return { whileHover: animate, transition };
  }

  if (animation.trigger === 'onScroll') {
    return { initial, whileInView: animate, viewport: { once: false, amount: 0.5 }, transition };
  }

  return { initial, animate, transition };
}

export const FrameRenderer = React.memo(function FrameRenderer({ node, children }: FrameRendererProps) {
  const layoutStyles = getLayoutStyles(node);

  const motionProps = useMemo(() => {
    if (!node.animation || node.animation.keyframes.length === 0) return null;
    return buildMotionProps(node.animation);
  }, [node.animation]);

  if (motionProps) {
    return (
      <motion.div style={layoutStyles} data-frame-id={node.id} {...motionProps}>
        {children}
      </motion.div>
    );
  }

  return (
    <div style={layoutStyles} data-frame-id={node.id}>
      {children}
    </div>
  );
});
