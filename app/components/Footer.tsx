"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const PRODUCT_LINKS = [
  { l: "Templates", h: "/templates" },
  { l: "Pricing", h: "/pricing" },
  { l: "Dashboard", h: "/dashboard" },
  { l: "AI Design", h: "/editor" },
  { l: "View Demo", h: "/preview" },
];

const SUPPORT_LINKS = [
  { l: "Contact Us", h: "#" },
  { l: "Privacy Policy", h: "#" },
  { l: "Terms", h: "#" },
  { l: "Refund Policy", h: "#" },
];

export function Footer() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/invite/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/studio")
  ) {
    return null;
  }

  return (
    <footer className="relative isolate overflow-hidden bg-background">
      <div className="hairline" />
      <div className="spotlight-tl" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1320px] px-6 pt-24 pb-12 lg:px-8">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="font-script text-4xl text-primary">
              Invitara
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Cinematic wedding invitation websites. AI-powered, beautifully crafted, instantly
              shareable.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
              <span className="h-px w-6 bg-muted-foreground/40" />
              Est. 2024 · India
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-6 text-[10px] font-medium uppercase tracking-[0.4em] text-primary/80">
              Product
            </h4>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((item) => (
                <li key={item.l}>
                  <Link
                    href={item.h}
                    className="font-display italic text-base text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-6 text-[10px] font-medium uppercase tracking-[0.4em] text-primary/80">
              Support
            </h4>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.l}>
                  <Link
                    href={l.h}
                    className="font-display italic text-base text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-16">
          <div className="hairline" />
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">
              © {new Date().getFullYear()} Invitara · All rights reserved
            </p>
            <ThemeToggle />
          </div>
        </div>

        {/* Editorial watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none mt-12 select-none overflow-hidden"
        >
          <div
            className="font-display font-extralight leading-none text-foreground"
            style={{
              fontSize: "clamp(6rem, 18vw, 14rem)",
              letterSpacing: "-0.05em",
              opacity: 0.06,
              whiteSpace: "nowrap",
            }}
          >
            INVITARA
          </div>
        </div>
      </div>
    </footer>
  );
}
