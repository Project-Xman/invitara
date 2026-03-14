import { db } from "./drizzle";
import { adImpressions, ads } from "./schema";
import { eq, and, lte, gte, or, isNull } from "drizzle-orm";

// ━━━ AD SLOTS ━━━
export type AdSlot =
  | "hero_banner"
  | "template_sidebar"
  | "editor_bottom"
  | "dashboard_top"
  | "preview_footer"
  | "between_events";

// ━━━ INTERNAL AD TYPE ━━━
export interface InternalAd {
  id: string;
  slot: AdSlot;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  gradient: string;
  icon: string;
  priority: number;
}

// ━━━ GET AD FOR SLOT (DB-driven) ━━━
export async function getAdForSlot(slot: AdSlot, excludeIds: string[] = []): Promise<InternalAd | null> {
  const now = new Date();
  const allAds = await db.select().from(ads).where(
    and(
      eq(ads.slot, slot),
      eq(ads.active, true),
      or(isNull(ads.startDate), lte(ads.startDate, now)),
      or(isNull(ads.endDate), gte(ads.endDate, now))
    )
  );

  const candidates = allAds
    .filter((a) => !excludeIds.includes(a.id))
    .sort((a, b) => b.priority - a.priority);

  if (candidates.length === 0) return null;

  if (candidates.length > 1 && Math.random() > 0.7) {
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return { ...picked, slot: picked.slot as AdSlot };
  }
  return { ...candidates[0], slot: candidates[0].slot as AdSlot };
}

// ━━━ TRACK AD IMPRESSION ━━━
export async function trackAdImpression(userId: string | null, adSlot: string, adId?: string) {
  await db.insert(adImpressions).values({
    userId,
    adSlot,
    adId: adId ?? null,
    adProvider: "internal",
    clicked: false,
  });
}

// ━━━ TRACK AD CLICK ━━━
export async function trackAdClick(userId: string | null, adSlot: string, adId: string) {
  await db.insert(adImpressions).values({
    userId,
    adSlot,
    adId,
    adProvider: "internal",
    clicked: true,
  });
}

// ━━━ SHOULD SHOW ADS ━━━
export function shouldShowAds(userPlan: string | null): boolean {
  if (!userPlan || userPlan === "free") return true;
  return false;
}
