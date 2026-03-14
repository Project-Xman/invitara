import { db } from "./drizzle";
import { adImpressions } from "./schema";

// ━━━ AD SLOTS ━━━
export type AdSlot =
  | "hero_banner"
  | "template_sidebar"
  | "editor_bottom"
  | "dashboard_top"
  | "preview_footer"
  | "between_events";

// ━━━ INTERNAL AD CATALOG ━━━
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

export const INTERNAL_ADS: InternalAd[] = [
  {
    id: "upgrade-premium",
    slot: "hero_banner",
    title: "Go Premium ✦",
    description: "Remove ads, unlock all templates, get AI design credits & custom domain.",
    ctaText: "Upgrade Now — ₹3,999",
    ctaLink: "/pricing",
    gradient: "linear-gradient(135deg, #A67C2E 0%, #D4A853 50%, #FFD466 100%)",
    icon: "👑",
    priority: 10,
  },
  {
    id: "ai-credits",
    slot: "editor_bottom",
    title: "AI-Powered Designs",
    description: "Let AI generate unique color palettes and design suggestions for your invite.",
    ctaText: "Try AI Design — 1 Credit",
    ctaLink: "/ai-generate",
    gradient: "linear-gradient(135deg, #4A3A6B 0%, #7A6AAB 50%, #D4A853 100%)",
    icon: "✨",
    priority: 8,
  },
  {
    id: "credit-sale",
    slot: "dashboard_top",
    title: "Credit Sale!",
    description: "Get 15 AI generation credits for just ₹249. Create stunning custom designs.",
    ctaText: "Buy Credits →",
    ctaLink: "/account",
    gradient: "linear-gradient(135deg, #C73866 0%, #E8668E 50%, #D4A853 100%)",
    icon: "🎁",
    priority: 7,
  },
  {
    id: "share-invite",
    slot: "preview_footer",
    title: "Love your invite?",
    description: "Share Invitara with friends & earn 2 free AI credits per referral!",
    ctaText: "Share & Earn",
    ctaLink: "/account",
    gradient: "linear-gradient(135deg, #1A4A3A 0%, #2A7A5A 50%, #D4A853 100%)",
    icon: "💌",
    priority: 5,
  },
  {
    id: "template-new",
    slot: "template_sidebar",
    title: "New: Cherry Blossom 🌸",
    description: "Our newest template is here — golden cherry blossoms for spring weddings.",
    ctaText: "Preview Template",
    ctaLink: "/templates",
    gradient: "linear-gradient(135deg, #E8668E 0%, #FF99B5 50%, #D4A853 100%)",
    icon: "🌸",
    priority: 6,
  },
  {
    id: "between-events-upgrade",
    slot: "between_events",
    title: "Remove this ad",
    description: "Upgrade to Premium for an ad-free experience.",
    ctaText: "Go Ad-Free",
    ctaLink: "/pricing",
    gradient: "linear-gradient(135deg, #D4A853 0%, #FFE49A 100%)",
    icon: "✦",
    priority: 3,
  },
];

// ━━━ GET AD FOR SLOT ━━━
export function getAdForSlot(slot: AdSlot, excludeIds: string[] = []): InternalAd | null {
  const candidates = INTERNAL_ADS.filter((a) => a.slot === slot && !excludeIds.includes(a.id)).sort(
    (a, b) => b.priority - a.priority
  );
  // Add some randomness
  if (candidates.length > 1 && Math.random() > 0.7) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return candidates[0] || null;
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
