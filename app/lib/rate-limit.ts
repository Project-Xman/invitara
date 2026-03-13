/**
 * Simple in-memory rate limiter.
 * For production at scale, replace backing store with Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Prune expired entries every 5 minutes to avoid unbounded growth
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  },
  5 * 60 * 1000
);

/**
 * Check and increment a rate limit counter.
 * @param key     Unique key (e.g. "login:127.0.0.1" or "register:user@mail.com")
 * @param limit   Max requests allowed in the window
 * @param windowMs  Window size in milliseconds
 * @returns `true` if the request is allowed, `false` if the limit is exceeded
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}

/** Convenience wrapper that throws an error when rate-limited. */
export function assertRateLimit(key: string, limit: number, windowMs: number) {
  if (!checkRateLimit(key, limit, windowMs)) {
    throw new Error("Too many requests. Please try again later.");
  }
}
