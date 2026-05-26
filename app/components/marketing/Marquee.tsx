import type { ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
};

export function Marquee({ children, speed = 40, className = "", pauseOnHover = true }: MarqueeProps) {
  return (
    <div className={"relative w-full overflow-hidden " + className}>
      <div
        className={"flex w-max " + (pauseOnHover ? "animate-marquee hover:[animation-play-state:paused]" : "animate-marquee")}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
