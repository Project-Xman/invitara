/**
 * Lightweight Sentry wrapper. If @sentry/nextjs is installed and DSN set,
 * it forwards. Otherwise no-ops so callers can stay clean.
 *
 * To enable:
 *   npm install @sentry/nextjs
 *   Create sentry.client.config.ts / sentry.server.config.ts at repo root.
 *   Set SENTRY_DSN + NEXT_PUBLIC_SENTRY_DSN in env.
 */

import { env } from "./env";
import { log } from "./logger";

type SentryLike = {
  captureException: (err: unknown, ctx?: Record<string, unknown>) => void;
  captureMessage: (msg: string, level?: string) => void;
  setUser: (u: { id?: string; email?: string } | null) => void;
  setTag: (key: string, value: string) => void;
};

let sentry: SentryLike | null = null;

async function getSentry(): Promise<SentryLike | null> {
  if (sentry) return sentry;
  if (!env.SENTRY_DSN) return null;
  try {
    const mod: any = await import("@sentry/nextjs" as any).catch(() => null);
    if (!mod) return null;
    sentry = mod;
    return sentry;
  } catch {
    return null;
  }
}

export async function captureException(err: unknown, ctx?: Record<string, unknown>): Promise<void> {
  log.error("captureException", { err: String(err), ...ctx });
  const s = await getSentry();
  s?.captureException(err, ctx);
}

export async function captureMessage(msg: string, level: "info" | "warning" | "error" = "info"): Promise<void> {
  const s = await getSentry();
  s?.captureMessage(msg, level);
}

export async function setSentryUser(u: { id?: string; email?: string } | null): Promise<void> {
  const s = await getSentry();
  s?.setUser(u);
}
