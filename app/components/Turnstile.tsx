"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

interface Props {
  siteKey?: string;
  onToken: (token: string) => void;
  action?: string;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

/**
 * Cloudflare Turnstile widget. Renders the challenge and forwards token via onToken.
 * If `siteKey` is empty, renders a placeholder (dev mode).
 */
export function Turnstile({ siteKey, onToken, action, theme = "auto", className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const effectiveSiteKey = siteKey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  useEffect(() => {
    if (!effectiveSiteKey || !containerRef.current) return;
    let mounted = true;

    const renderWidget = () => {
      if (!mounted || !window.turnstile || !containerRef.current) return;
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: effectiveSiteKey,
          action,
          theme,
          callback: (token: string) => onToken(token),
          "error-callback": () => onToken(""),
          "expired-callback": () => onToken(""),
        });
      } catch (err) {
        console.warn("[Turnstile] render failed:", err);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 10_000);
    }

    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }
    };
  }, [effectiveSiteKey, action, theme, onToken]);

  if (!effectiveSiteKey) {
    return (
      <div className={className} style={{ fontSize: 12, color: "#999", padding: 8 }}>
        [Turnstile disabled — set NEXT_PUBLIC_TURNSTILE_SITE_KEY]
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        strategy="afterInteractive"
      />
      <div ref={containerRef} className={className} />
    </>
  );
}
