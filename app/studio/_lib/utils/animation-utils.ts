import type { AnimationProps } from '~/studio/_lib/types';

export function toFramerMotionProps(animation: AnimationProps | null) {
  if (!animation || animation.keyframes.length === 0) return null;

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
    delay: maxDelay,
    ease: animation.keyframes[0]?.ease ?? 'easeInOut',
  };

  if (animation.loop) {
    transition.repeat = Infinity;
    transition.repeatType = 'reverse';
  }

  return { initial, animate, transition };
}

export function getHoverProps(animation: AnimationProps | null) {
  if (!animation || animation.trigger !== 'onHover') return null;

  const whileHover: Record<string, number> = {};
  for (const kf of animation.keyframes) {
    whileHover[kf.property] = kf.to;
  }

  return { whileHover };
}
