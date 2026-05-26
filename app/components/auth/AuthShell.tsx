"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { GrainOverlay } from "../marketing/GrainOverlay";
import { Spotlight } from "../marketing/Spotlight";

type AuthShellProps = {
  side?: "left" | "right"; // form side
  quote: string;
  stats?: { v: string; l: string }[];
  eyebrow?: string;
  children: ReactNode;
};

export function AuthShell({
  side = "right",
  quote,
  stats = [],
  eyebrow,
  children,
}: AuthShellProps) {
  const brandPanel = (
    <div className="relative isolate hidden overflow-hidden bg-background lg:flex lg:w-[40%] lg:flex-col lg:justify-between lg:p-12 xl:w-[40%]">
      <Spotlight origin="tl" intensity={0.14} />
      <GrainOverlay />

      <Link
        href="/"
        className="relative z-10 inline-flex w-fit font-script text-[44px] leading-none text-primary"
      >
        Invitara
      </Link>

      <div className="relative z-10 max-w-md">
        <blockquote className="font-display text-3xl md:text-4xl font-light italic leading-[1.15] tracking-[-0.01em] text-foreground">
          <span className="text-primary/60">&ldquo;</span>
          {quote}
          <span className="text-primary/60">&rdquo;</span>
        </blockquote>
        {stats.length > 0 && (
          <>
            <div className="mt-10 hairline" />
            <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((s) => (
                <div key={s.l}>
                  <div className="font-display italic text-2xl font-light text-primary">{s.v}</div>
                  <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative z-10 text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60">
        Cinematic invitations · Crafted in India
      </div>
    </div>
  );

  const formPanel = (
    <div className="relative isolate flex w-full flex-col items-center justify-center bg-background px-6 py-16 lg:w-[60%] lg:px-16">
      <Spotlight origin="center" intensity={0.06} />
      <div className="relative z-10 w-full max-w-md">
        {eyebrow && (
          <p className="section-eyebrow mb-6">
            <span className="chapter-num">00</span>
            <span className="h-px w-6 bg-primary/40" />
            <span>{eyebrow}</span>
          </p>
        )}
        {children}
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen w-full">
      {side === "left" ? (
        <>
          {formPanel}
          {brandPanel}
        </>
      ) : (
        <>
          {brandPanel}
          {formPanel}
        </>
      )}
    </div>
  );
}
