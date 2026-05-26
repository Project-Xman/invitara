/**
 * Distributed rate limiting.
 * - Production: Upstash Redis sliding-window via REST (works on serverless).
 * - Dev / when Upstash unset: in-memory fallback (per-process only).
 *
 * Usage:
 *   const r = await rateLimit("login", ip, RL.login);
 *   if (!r.success) throw new Error("Too many requests");
 *
 *   // Or, throw on exceed:
 *   await assertRateLimit("login", ip, RL.login);
 */

import { env } from "./env";

export interface RateLimitOpts {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface Bucket {
  count: number;
  expiresAt: number;
}

const localStore = new Map<string, Bucket>();

function localCheck(key: string, opts: RateLimitOpts): RateLimitResult {
  const now = Date.now();
  const bucket = localStore.get(key);
  if (!bucket || bucket.expiresAt < now) {
    const expiresAt = now + opts.windowMs;
    localStore.set(key, { count: 1, expiresAt });
    return { success: true, remaining: opts.limit - 1, resetAt: expiresAt };
  }
  if (bucket.count >= opts.limit) {
    return { success: false, remaining: 0, resetAt: bucket.expiresAt };
  }
  bucket.count++;
  return { success: true, remaining: opts.limit - bucket.count, resetAt: bucket.expiresAt };
}

async function upstashCheck(key: string, opts: RateLimitOpts): Promise<RateLimitResult | null> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;

  const windowSec = Math.ceil(opts.windowMs / 1000);
  const url = `${env.UPSTASH_REDIS_REST_URL}/pipeline`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSec), "NX"],
        ["PTTL", key],
      ]),
    });
    if (!res.ok) {
      console.warn("[rate-limit] upstash error, falling back to local:", res.status);
      return null;
    }
    const data = (await res.json()) as Array<{ result: number | string }>;
    const count = Number(data[0]?.result ?? 0);
    const pttl = Number(data[2]?.result ?? opts.windowMs);
    const resetAt = Date.now() + (pttl > 0 ? pttl : opts.windowMs);
    const success = count <= opts.limit;
    return { success, remaining: Math.max(0, opts.limit - count), resetAt };
  } catch (err) {
    console.warn("[rate-limit] upstash fetch failed, falling back to local:", err);
    return null;
  }
}

export async function rateLimit(
  namespace: string,
  identifier: string,
  opts: RateLimitOpts
): Promise<RateLimitResult> {
  const key = `rl:${namespace}:${identifier}`;
  const upstash = await upstashCheck(key, opts);
  if (upstash) return upstash;
  return localCheck(key, opts);
}

export class RateLimitError extends Error {
  status = 429;
  constructor(public retryAfter: number) {
    super(`Too many requests. Retry in ${retryAfter}s.`);
    this.name = "RateLimitError";
  }
}

export async function assertRateLimit(
  namespace: string,
  identifier: string,
  opts: RateLimitOpts
): Promise<RateLimitResult>;
export async function assertRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult>;
export async function assertRateLimit(
  a: string,
  b: string | number,
  c: RateLimitOpts | number
): Promise<RateLimitResult> {
  let namespace: string;
  let identifier: string;
  let opts: RateLimitOpts;
  if (typeof b === "number") {
    // Legacy 3-arg form: (key, limit, windowMs)
    namespace = a.split(":")[0] || "legacy";
    identifier = a.includes(":") ? a.slice(a.indexOf(":") + 1) : a;
    opts = { limit: b, windowMs: c as number };
  } else {
    namespace = a;
    identifier = b;
    opts = c as RateLimitOpts;
  }
  const r = await rateLimit(namespace, identifier, opts);
  if (!r.success) {
    const retryAfterSec = Math.ceil((r.resetAt - Date.now()) / 1000);
    throw new RateLimitError(retryAfterSec);
  }
  return r;
}

/** Backwards-compatible sync wrapper for old callers (uses local store only). */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  return localCheck(key, { limit, windowMs }).success;
}

/** Preset configs */
export const RL = {
  login: { limit: 5, windowMs: 60_000 },
  register: { limit: 3, windowMs: 60_000 },
  passwordReset: { limit: 3, windowMs: 60 * 60_000 },
  otpSend: { limit: 3, windowMs: 60_000 },
  otpVerify: { limit: 5, windowMs: 60_000 },
  rsvpSubmit: { limit: 5, windowMs: 60_000 },
  wishSubmit: { limit: 3, windowMs: 60_000 },
  upload: { limit: 20, windowMs: 60_000 },
  webhook: { limit: 100, windowMs: 60_000 },
  ai: { limit: 10, windowMs: 60_000 },
  bulkSend: { limit: 5, windowMs: 60 * 60_000 },
} as const;
