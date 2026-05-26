"use client";

import { motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { type ReactNode, type HTMLAttributes } from "react";

type SpotlightCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  radius?: number;
  intensity?: number;
};

export function SpotlightCard({
  children,
  className = "",
  radius = 400,
  intensity = 0.10,
  ...rest
}: SpotlightCardProps) {
  const reduce = useReducedMotion();
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);

  const overlay = useTransform([x, y], ([xv, yv]) =>
    `radial-gradient(${radius}px circle at ${xv}px ${yv}px, oklch(var(--primary) / ${intensity}), transparent 50%)`
  );

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  function onLeave() {
    x.set(-9999);
    y.set(-9999);
  }

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={"group/spot relative isolate " + className}
      {...rest}
    >
      {children}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
          style={{ background: overlay }}
        />
      )}
    </div>
  );
}
