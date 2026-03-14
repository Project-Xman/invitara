import { db } from "./drizzle";
import { users, templates, templatePurchases, payments, invitations, plans as plansTable } from "./schema";
import { eq, and } from "drizzle-orm";

// ━━━ PLAN CACHE (60s TTL) ━━━
let planCache: { data: (typeof plansTable.$inferSelect)[]; timestamp: number } | null = null;
const PLAN_CACHE_TTL = 60_000;

export async function getPlansFromDB() {
  if (planCache && Date.now() - planCache.timestamp < PLAN_CACHE_TTL) {
    return planCache.data;
  }
  const data = await db.select().from(plansTable).orderBy(plansTable.sortOrder);
  planCache = { data, timestamp: Date.now() };
  return data;
}

export function invalidatePlanCache() {
  planCache = null;
}

export async function getPlanLimits(planId: string) {
  const allPlans = await getPlansFromDB();
  const plan = allPlans.find((p) => p.id === planId);
  if (!plan) return { maxPublished: 1, maxEvents: 2, maxPhotos: 3 };
  return {
    maxPublished: plan.maxPublished === 0 ? Infinity : plan.maxPublished,
    maxEvents: plan.maxEvents === 0 ? Infinity : plan.maxEvents,
    maxPhotos: plan.maxPhotos === 0 ? Infinity : plan.maxPhotos,
  };
}

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
  const allPlans = await getPlansFromDB();
  const planData = allPlans.find((p) => p.id === plan);
  if (!planData) throw new Error("Plan not found");

  await db.insert(payments).values({
    userId,
    type: "subscription",
    amount: String(planData.price),
    currency: "INR",
    status,
    razorpayPaymentId: paymentId,
    metadata: { plan },
  });

  if (status === "completed") {
    const [user] = await db.select({ credits: users.credits }).from(users).where(eq(users.id, userId));
    const newCredits = (user?.credits || 0) + planData.credits;
    await db.update(users).set({ plan, showAds: false, credits: newCredits, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  return { plan, bonusCredits: planData.credits };
}

// ━━━ CHECK PUBLISH LIMIT ━━━
export async function canPublish(userId: string): Promise<{ allowed: boolean; current: number; max: number }> {
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
  if (!user) return { allowed: false, current: 0, max: 0 };

  const limits = await getPlanLimits(user.plan);
  const max = limits.maxPublished;
  if (max === Infinity) return { allowed: true, current: 0, max };

  const published = await db.select({ id: invitations.id }).from(invitations)
    .where(and(eq(invitations.userId, userId), eq(invitations.published, true)));

  return { allowed: published.length < max, current: published.length, max };
}

// ━━━ GET PLANS FOR DISPLAY ━━━
export async function getPlans() {
  const allPlans = await getPlansFromDB();
  return allPlans.filter((p) => p.active).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    showAds: p.showAds,
    credits: p.credits,
    maxPublished: p.maxPublished === 0 ? Infinity : p.maxPublished,
    badge: p.badge,
    features: p.features,
  }));
}
