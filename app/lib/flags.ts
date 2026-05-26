/**
 * Simple feature flags. DB-backed for runtime toggling without redeploy.
 * Cached in-process for 60s.
 */

import { db } from "./drizzle";
import { featureFlags } from "./schema";
import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";

const cache = new Map<string, { value: { enabled: boolean; rollout: number }; expiresAt: number }>();
const TTL_MS = 60_000;

async function load(key: string) {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return cached.value;

  const [row] = await db.select().from(featureFlags).where(eq(featureFlags.key, key)).limit(1);
  const value = row
    ? { enabled: row.enabled, rollout: row.rolloutPercent }
    : { enabled: false, rollout: 0 };
  cache.set(key, { value, expiresAt: now + TTL_MS });
  return value;
}

function bucket(userKey: string): number {
  const h = createHash("sha1").update(userKey).digest();
  return h[0]; // 0-255
}

/**
 * Returns true if `key` is enabled for `userKey`. Rollout percent gates
 * deterministically by user.
 */
export async function isEnabled(key: string, userKey?: string | null): Promise<boolean> {
  const { enabled, rollout } = await load(key);
  if (!enabled) return false;
  if (rollout >= 100) return true;
  if (!userKey) return rollout > 0 && Math.random() * 100 < rollout;
  const slot = bucket(`${key}:${userKey}`) / 2.56; // 0-100
  return slot < rollout;
}

export async function setFlag(key: string, enabled: boolean, rolloutPercent: number, description?: string) {
  cache.delete(key);
  await db
    .insert(featureFlags)
    .values({ key, enabled, rolloutPercent, description: description ?? null, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: featureFlags.key,
      set: { enabled, rolloutPercent, description: description ?? null, updatedAt: new Date() },
    });
}
