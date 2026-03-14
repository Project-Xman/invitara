import { db } from "./drizzle";
import { users, templates, templatePurchases, payments, invitations } from "./schema";
import { eq, and } from "drizzle-orm";

// ━━━ CHECK IF USER OWNS TEMPLATE ━━━
export async function userOwnsTemplate(userId: string, templateId: string): Promise<boolean> {
  // Premium/Royal users own all templates
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
  if (user && (user.plan === "premium" || user.plan === "royal")) return true;

  // Check if free template
  const [tmpl] = await db
    .select({ isFree: templates.isFree })
    .from(templates)
    .where(eq(templates.id, templateId));
  if (tmpl?.isFree) return true;

  // Check individual purchase
  const [purchase] = await db
    .select()
    .from(templatePurchases)
    .where(and(eq(templatePurchases.userId, userId), eq(templatePurchases.templateId, templateId)))
    .limit(1);

  return !!purchase;
}

// ━━━ GET USER'S PURCHASED TEMPLATES ━━━
export async function getUserTemplates(userId: string) {
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));

  // Premium/Royal get everything
  if (user && (user.plan === "premium" || user.plan === "royal")) {
    return db.select().from(templates).where(eq(templates.active, true));
  }

  // Get free templates + purchased
  const purchases = await db
    .select({ templateId: templatePurchases.templateId })
    .from(templatePurchases)
    .where(eq(templatePurchases.userId, userId));

  const purchasedIds = purchases.map((p) => p.templateId);
  const allTemplates = await db.select().from(templates).where(eq(templates.active, true));

  return allTemplates.map((t) => ({
    ...t,
    owned: t.isFree || purchasedIds.includes(t.id),
    locked: !t.isFree && !purchasedIds.includes(t.id),
  }));
}

// ━━━ PURCHASE TEMPLATE ━━━
export async function purchaseTemplate(
  userId: string,
  templateId: string,
  paymentId: string,
  status: "pending" | "completed" = "completed"
) {
  const [tmpl] = await db.select().from(templates).where(eq(templates.id, templateId));
  if (!tmpl) throw new Error("Template not found");

  // Check not already owned
  const owned = await userOwnsTemplate(userId, templateId);
  if (owned) throw new Error("Template already owned");

  // Record payment
  await db.insert(payments).values({
    userId,
    type: "template",
    amount: String(tmpl.price),
    currency: "INR",
    status,
    razorpayPaymentId: paymentId,
    metadata: { templateId, templateName: tmpl.name },
  });

  // Only grant access once payment is confirmed
  if (status === "completed") {
    await db.insert(templatePurchases).values({ userId, templateId });
  }
  return tmpl;
}

// ━━━ UPGRADE PLAN ━━━
export async function upgradePlan(
  userId: string,
  plan: "starter" | "premium" | "royal",
  paymentId: string,
  status: "pending" | "completed" = "completed"
) {
  const planPrices = { starter: 2999, premium: 3999, royal: 6999 };
  const planCredits = { starter: 5, premium: 15, royal: 50 };

  await db.insert(payments).values({
    userId,
    type: "subscription",
    amount: String(planPrices[plan]),
    currency: "INR",
    status,
    razorpayPaymentId: paymentId,
    metadata: { plan },
  });

  // Only grant access once payment is confirmed
  if (status === "completed") {
    const [user] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));
    const newCredits = (user?.credits || 0) + planCredits[plan];
    await db
      .update(users)
      .set({
        plan,
        showAds: false,
        credits: newCredits,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  return { plan, bonusCredits: planCredits[plan] };
}

// ━━━ PLAN LIMITS ━━━
export const PLAN_LIMITS = {
  free: { maxPublished: 1, maxEvents: 2, maxPhotos: 3 },
  starter: { maxPublished: 3, maxEvents: 5, maxPhotos: 8 },
  premium: { maxPublished: 10, maxEvents: Infinity, maxPhotos: 20 },
  royal: { maxPublished: Infinity, maxEvents: Infinity, maxPhotos: 50 },
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;

// ━━━ CHECK PUBLISH LIMIT ━━━
export async function canPublish(userId: string): Promise<{ allowed: boolean; current: number; max: number }> {
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
  if (!user) return { allowed: false, current: 0, max: 0 };

  const plan = user.plan as PlanId;
  const max = PLAN_LIMITS[plan].maxPublished;

  if (max === Infinity) return { allowed: true, current: 0, max };

  const published = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(and(eq(invitations.userId, userId), eq(invitations.published, true)));

  return { allowed: published.length < max, current: published.length, max };
}

// ━━━ PRICING PLANS ━━━
export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    showAds: true,
    credits: 3,
    maxPublished: PLAN_LIMITS.free.maxPublished,
    features: [
      "2 Free Templates",
      `${PLAN_LIMITS.free.maxPublished} Published Invitation`,
      "Up to 2 Events",
      "Basic Photo Gallery",
      "RSVP via WhatsApp",
      "Invitara Branding",
      "Ads Shown",
      "3 AI Credits",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 2999,
    showAds: false,
    credits: 5,
    maxPublished: PLAN_LIMITS.starter.maxPublished,
    features: [
      "Purchase Templates Individually",
      `Up to ${PLAN_LIMITS.starter.maxPublished} Published Invitations`,
      "Up to 5 Events",
      "Photo Gallery (8 photos)",
      "RSVP Dashboard",
      "No Ads",
      "Remove Branding",
      "5 Bonus AI Credits",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 3999,
    showAds: false,
    credits: 15,
    badge: "Most Popular",
    maxPublished: PLAN_LIMITS.premium.maxPublished,
    features: [
      "ALL Templates Included",
      `Up to ${PLAN_LIMITS.premium.maxPublished} Published Invitations`,
      "Unlimited Events",
      "Photo Gallery (20 photos)",
      "RSVP Dashboard + Analytics",
      "No Ads",
      "Custom Domain",
      "Background Music",
      "15 Bonus AI Credits",
      "Priority Support",
    ],
  },
  {
    id: "royal",
    name: "Royal",
    price: 6999,
    showAds: false,
    credits: 50,
    maxPublished: Infinity,
    features: [
      "Everything in Premium",
      "Unlimited Published Invitations",
      "Custom Design Tweaks",
      "Video Background",
      "Multi-language Support",
      "Guest Management CRM",
      "QR Code Invites",
      "50 Bonus AI Credits",
      "Concierge Setup",
      "Dedicated Manager",
    ],
  },
] as const;
