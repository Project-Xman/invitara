import { useRef, useEffect, useState, type ReactNode } from "react";

export function SectionReveal({
  children,
  animation = "fadeUp",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scaleIn";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseStyle: React.CSSProperties = {
    transitionDelay: `${delay}ms`,
  };

  const animClass = visible ? "reveal-visible" : `reveal-hidden-${animation}`;

  return (
    <div ref={ref} className={`reveal-base ${animClass} ${className}`} style={baseStyle}>
      {children}
    </div>
  );
}
