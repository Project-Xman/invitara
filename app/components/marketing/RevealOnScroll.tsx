"use client";

import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Variant = "fadeUp" | "fadeIn" | "mask" | "slideLeft" | "slideRight" | "scaleIn";

type RevealOnScrollProps = {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  as?: "div" | "section" | "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  once?: boolean;
  margin?: string;
};

const VARIANTS: Record<Variant, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  mask: {
    hidden: { opacity: 0, y: 20, clipPath: "inset(0 0 100% 0)" },
    visible: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
};

export function RevealOnScroll({
  children,
  variant = "mask",
  delay = 0,
  duration = 0.9,
  as = "div",
  className = "",
  once = true,
  margin = "-15% 0px",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once, margin: margin as `${number}px` });

  const v = reduce ? VARIANTS.fadeIn : VARIANTS[variant];
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref}
      variants={v}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{
        duration: reduce ? 0.2 : duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
