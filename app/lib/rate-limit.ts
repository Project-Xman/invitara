/**
 * Rate limiting using @tanstack/pacer's RateLimiter.
 *
 * NOTE: This is an in-memory store — it resets on server restarts and does NOT
 * persist across serverless function invocations (Vercel, AWS Lambda, etc.).
 *
 * For production at scale, replace with a Redis-backed solution:
 *   - @upstash/redis + @upstash/ratelimit (sliding window, works serverless)
 */

import { RateLimiter } from "@tanstack/pacer";

type NoArgFn = () => void;

// Cache of per-key limiters — keyed by "key:limit:windowMs"
const limiters = new Map<string, RateLimiter<NoArgFn>>();

function getLimiter(key: string, limit: number, windowMs: number): RateLimiter<NoArgFn> {
  const cacheKey = `${key}:${limit}:${windowMs}`;
  if (!limiters.has(cacheKey)) {
    limiters.set(
      cacheKey,
      new RateLimiter<NoArgFn>(() => {}, {
        limit,
        window: windowMs,
      })
    );
  }
  return limiters.get(cacheKey)!;
}

/**
 * Check and increment a rate limit counter.
 * @param key     Unique key (e.g. "login:127.0.0.1" or "register:user@mail.com")
 * @param limit   Max requests allowed in the window
 * @param windowMs  Window size in milliseconds
 * @returns `true` if the request is allowed, `false` if the limit is exceeded
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const limiter = getLimiter(key, limit, windowMs);
  return limiter.maybeExecute() !== false;
}

/** Convenience wrapper that throws an error when rate-limited. */
export function assertRateLimit(key: string, limit: number, windowMs: number): void {
  if (!checkRateLimit(key, limit, windowMs)) {
    throw new Error("Too many requests. Please try again later.");
  }
}
