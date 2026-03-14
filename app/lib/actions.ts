"use server";

import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db } from "./drizzle";
import { users, templates, invitations, events, rsvps, creditPackages, payments } from "./schema";
import { eq, desc, and } from "drizzle-orm";
import {
  registerUser,
  loginUser,
  createSession,
  validateSession,
  invalidateSession,
  verifyEmailToken,
  createPasswordResetToken,
  resetPasswordWithToken,
  toSafeUser,
  type SafeUser,
} from "./auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import {
  getCredits,
  getCreditHistory,
  addCredits,
  debitCredits,
  getCreditPackages,
  purchaseCredits,
  CREDIT_COSTS,
} from "./credits";
import { generateDesign } from "./ai-generate";
import type { AIDesignRequest } from "./ai-generate";
import {
  trackEvent,
  getInvitationAnalytics,
  getDailyViews,
  getUserAnalyticsSummary,
} from "./analytics";
import {
  getUserTemplates,
  userOwnsTemplate,
  purchaseTemplate,
  upgradePlan,
  PLANS,
} from "./purchases";
import { getAdForSlot, trackAdImpression, trackAdClick, shouldShowAds, type AdSlot } from "./ads";
import { assertRateLimit } from "./rate-limit";
import { env } from "./env";

// Helper: extract token from cookie header
async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("invitara_token")?.value ?? null;
}

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  cookieStore.set("invitara_token", token, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
  });
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set("invitara_token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
}

// ━━━ AUTH SERVER ACTIONS ━━━
export async function getSession(): Promise<SafeUser | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  const user = await validateSession(token);
  if (!user) return null;
  return toSafeUser(user);
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<SafeUser> {
  // 5 registrations per email per 15 minutes
  assertRateLimit(`register:${data.email.toLowerCase()}`, 5, 15 * 60 * 1000);
  const user = await registerUser(data);
  const { token } = await createSession(user.id);
  await setSessionCookie(token);
  // Send verification email (fire-and-forget in dev; awaited in prod via email provider)
  if (user.emailVerificationToken) {
    sendVerificationEmail(user.email, user.emailVerificationToken).catch(console.error);
  }
  return toSafeUser(user);
}

export async function login(data: { email: string; password: string }): Promise<SafeUser> {
  // 10 login attempts per email per 15 minutes
  assertRateLimit(`login:${data.email.toLowerCase()}`, 10, 15 * 60 * 1000);
  const user = await loginUser(data);
  const { token } = await createSession(user.id);
  await setSessionCookie(token);
  return toSafeUser(user);
}

// ━━━ LOGOUT ━━━
export async function logout(): Promise<void> {
  const token = await getTokenFromCookies();
  if (token) await invalidateSession(token);
  await clearSessionCookie();
}

// ━━━ EMAIL VERIFICATION ━━━
export async function verifyEmail(data: { token: string }): Promise<{ success: true }> {
  const verified = await verifyEmailToken(data.token);
  if (!verified) throw new Error("Invalid or expired verification token.");
  return { success: true };
}

// ━━━ FORGOT PASSWORD ━━━
export async function forgotPassword(data: { email: string }): Promise<{ success: true }> {
  // 3 requests per email per 15 minutes
  assertRateLimit(`forgot:${data.email.toLowerCase()}`, 3, 15 * 60 * 1000);
  const token = await createPasswordResetToken(data.email);
  if (token) {
    // Fire-and-forget in dev; awaited in prod via email provider
    sendPasswordResetEmail(data.email, token).catch(() => {});
  }
  // Always return success to prevent email enumeration
  return { success: true };
}

export async function resetPassword(data: {
  token: string;
  password: string;
}): Promise<{ success: true }> {
  const ok = await resetPasswordWithToken(data.token, data.password);
  if (!ok) throw new Error("Reset link is invalid or has expired.");
  return { success: true };
}

// ━━━ TEMPLATE SERVER ACTIONS ━━━
export async function getTemplates(data?: { category?: string }) {
  const conditions = [eq(templates.active, true)];
  if (data?.category && data.category !== "All") {
    conditions.push(eq(templates.category, data.category));
  }
  return db
    .select()
    .from(templates)
    .where(and(...conditions))
    .orderBy(templates.sortOrder);
}

export async function getMyTemplates() {
  const token = await getTokenFromCookies();
  if (!token) return [];
  const user = await validateSession(token);
  if (!user) return [];
  return getUserTemplates(user.id);
}

// ━━━ INVITATION SERVER ACTIONS ━━━
export async function getMyInvitations() {
  const token = await getTokenFromCookies();
  if (!token) return [];
  const user = await validateSession(token);
  if (!user) return [];
  return db
    .select()
    .from(invitations)
    .where(eq(invitations.userId, user.id))
    .orderBy(desc(invitations.updatedAt));
}

export async function getInvitation(data: { id: string }) {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  const [inv] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.id, data.id))
    .limit(1);

  if (!inv) return null;
  if (inv.userId !== user.id) throw new Error("Forbidden");
  return inv;
}

export async function saveInvitation(data: {
  id?: string;
  templateId: string;
  groomName: string;
  brideName: string;
  groomFamily?: string;
  brideFamily?: string;
  blessingFrom?: string;
  mantra?: string;
  message?: string;
  hashtag?: string;
  weddingDate?: string;
  venue?: string;
  mapLink?: string;
  instagramLink?: string;
  whatsappNumber?: string;
  photos?: string[];
  musicUrl?: string;
}): Promise<{ id: string; slug: string | undefined }> {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  if (data.id) {
    // Update: verify ownership first
    const [existing] = await db
      .select({ userId: invitations.userId })
      .from(invitations)
      .where(eq(invitations.id, data.id));
    if (!existing || existing.userId !== user.id) throw new Error("Forbidden");

    const { id, weddingDate, ...rest } = data;
    await db
      .update(invitations)
      .set({
        ...rest,
        weddingDate: weddingDate ? new Date(weddingDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(invitations.id, id));
    return { id: data.id, slug: undefined };
  } else {
    // Create: generate slug only on insert
    const slug = `${data.groomName.toLowerCase().replace(/\s+/g, "-")}-weds-${data.brideName.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
    const [inv] = await db
      .insert(invitations)
      .values({
        userId: user.id,
        templateId: data.templateId,
        slug,
        groomName: data.groomName,
        brideName: data.brideName,
        groomFamily: data.groomFamily,
        brideFamily: data.brideFamily,
        blessingFrom: data.blessingFrom,
        mantra: data.mantra,
        message: data.message,
        hashtag: data.hashtag,
        weddingDate: data.weddingDate ? new Date(data.weddingDate) : null,
        venue: data.venue,
        mapLink: data.mapLink,
        instagramLink: data.instagramLink,
        whatsappNumber: data.whatsappNumber,
      })
      .returning();
    return { id: inv.id, slug: inv.slug };
  }
}

// ━━━ PUBLISH / UNPUBLISH ━━━
export async function publishInvitation(data: { id: string }): Promise<{ slug: string }> {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  const [inv] = await db
    .select({ userId: invitations.userId, slug: invitations.slug })
    .from(invitations)
    .where(eq(invitations.id, data.id));
  if (!inv || inv.userId !== user.id) throw new Error("Forbidden");

  await db
    .update(invitations)
    .set({ published: true, updatedAt: new Date() })
    .where(eq(invitations.id, data.id));

  return { slug: inv.slug };
}

export async function unpublishInvitation(data: { id: string }): Promise<void> {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  const [inv] = await db
    .select({ userId: invitations.userId })
    .from(invitations)
    .where(eq(invitations.id, data.id));
  if (!inv || inv.userId !== user.id) throw new Error("Forbidden");

  await db
    .update(invitations)
    .set({ published: false, updatedAt: new Date() })
    .where(eq(invitations.id, data.id));
}

// ━━━ EVENT SERVER ACTIONS ━━━
export async function getEvents(data: { invitationId: string }) {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  const [inv] = await db
    .select({ userId: invitations.userId })
    .from(invitations)
    .where(eq(invitations.id, data.invitationId))
    .limit(1);
  if (!inv || inv.userId !== user.id) throw new Error("Forbidden");

  return db
    .select()
    .from(events)
    .where(eq(events.invitationId, data.invitationId))
    .orderBy(events.sortOrder);
}

export async function addEvent(data: {
  invitationId: string;
  name: string;
  date?: string;
  venue?: string;
  time?: string;
  icon?: string;
  color?: string;
}) {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  const [inv] = await db
    .select({ userId: invitations.userId })
    .from(invitations)
    .where(eq(invitations.id, data.invitationId))
    .limit(1);
  if (!inv || inv.userId !== user.id) throw new Error("Forbidden");

  const [ev] = await db
    .insert(events)
    .values({
      invitationId: data.invitationId,
      name: data.name,
      date: data.date || "TBD",
      venue: data.venue || "TBD",
      time: data.time || "TBD",
      icon: data.icon || "🎉",
      color: data.color || "#D4A853",
    })
    .returning();
  return ev;
}

export async function removeEvent(data: { id: number }): Promise<void> {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  // Verify ownership via join
  const [ev] = await db
    .select({ invitationUserId: invitations.userId })
    .from(events)
    .innerJoin(invitations, eq(events.invitationId, invitations.id))
    .where(eq(events.id, data.id))
    .limit(1);
  if (!ev || ev.invitationUserId !== user.id) throw new Error("Forbidden");

  await db.delete(events).where(eq(events.id, data.id));
}

// ━━━ RSVP SERVER ACTIONS ━━━
export async function getRsvps(data: { invitationId: string }) {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  const [inv] = await db
    .select({ userId: invitations.userId })
    .from(invitations)
    .where(eq(invitations.id, data.invitationId))
    .limit(1);
  if (!inv || inv.userId !== user.id) throw new Error("Forbidden");

  return db
    .select()
    .from(rsvps)
    .where(eq(rsvps.invitationId, data.invitationId))
    .orderBy(desc(rsvps.createdAt));
}

export async function updateRsvpStatus(data: {
  id: number;
  status: "attending" | "pending" | "declined";
}): Promise<void> {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  // Verify ownership via join
  const [rsvp] = await db
    .select({ invitationUserId: invitations.userId })
    .from(rsvps)
    .innerJoin(invitations, eq(rsvps.invitationId, invitations.id))
    .where(eq(rsvps.id, data.id))
    .limit(1);
  if (!rsvp || rsvp.invitationUserId !== user.id) throw new Error("Forbidden");

  await db.update(rsvps).set({ status: data.status }).where(eq(rsvps.id, data.id));
}

// ━━━ CREDIT SERVER ACTIONS ━━━
export async function getMyCredits(): Promise<{ credits: number; history: any[] }> {
  const token = await getTokenFromCookies();
  if (!token) return { credits: 0, history: [] };
  const user = await validateSession(token);
  if (!user) return { credits: 0, history: [] };
  const credits = await getCredits(user.id);
  const history = await getCreditHistory(user.id);
  return { credits, history };
}

export async function getCreditPacks() {
  return getCreditPackages();
}

// ━━━ AI SERVER ACTIONS ━━━
export async function generateAIDesign(data: {
  prompt: string;
  style?: string;
  invitationId?: string;
}) {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");
  const req: AIDesignRequest = {
    userId: user.id,
    prompt: data.prompt,
    style: data.style as AIDesignRequest["style"],
  };
  if (data.invitationId) req.invitationId = data.invitationId;
  return generateDesign(req);
}

// ━━━ ANALYTICS SERVER ACTIONS ━━━
export async function getAnalytics(data: { invitationId: string }) {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  const [inv] = await db
    .select({ userId: invitations.userId })
    .from(invitations)
    .where(eq(invitations.id, data.invitationId))
    .limit(1);
  if (!inv || inv.userId !== user.id) throw new Error("Forbidden");

  const summary = await getInvitationAnalytics(data.invitationId);
  const daily = await getDailyViews(data.invitationId);
  return { summary, daily };
}

// ━━━ AD SERVER ACTIONS ━━━
export async function getAd(data?: { slot?: string }) {
  const token = await getTokenFromCookies();
  let showAds = true;
  let userId: string | null = null;
  if (token) {
    const user = await validateSession(token);
    if (user) {
      userId = user.id;
      showAds = user.showAds;
    }
  }
  if (!showAds) return null;
  const ad = getAdForSlot((data?.slot || "hero_banner") as AdSlot);
  if (ad) {
    await trackAdImpression(userId, ad.slot, ad.id);
  }
  return ad;
}

export async function recordAdClick(data: { adSlot: string; adId: string }): Promise<void> {
  const token = await getTokenFromCookies();
  let userId: string | null = null;
  if (token) {
    const user = await validateSession(token);
    if (user) userId = user.id;
  }
  await trackAdClick(userId, data.adSlot, data.adId);
}

// ━━━ PLAN/PRICING ━━━
export async function getPlans() {
  return PLANS;
}

// ━━━ PUBLIC INVITE (by slug) ━━━
export async function getInvitationBySlug(data: { slug: string }) {
  const [inv] = await db.select().from(invitations).where(eq(invitations.slug, data.slug)).limit(1);
  if (!inv || !inv.published) return null;
  const evs = await db
    .select()
    .from(events)
    .where(eq(events.invitationId, inv.id))
    .orderBy(events.sortOrder);
  const [tmpl] = await db.select().from(templates).where(eq(templates.id, inv.templateId)).limit(1);
  return { invitation: inv, events: evs, template: tmpl ?? null };
}

// ━━━ RSVP SUBMISSION (guest-facing) ━━━
export async function submitRsvp(data: {
  invitationId: string;
  name: string;
  phone?: string;
  email?: string;
  guests?: number;
  eventsAttending?: string[];
  message?: string;
}) {
  // Verify invitation exists and is published
  const [inv] = await db
    .select({ id: invitations.id, published: invitations.published })
    .from(invitations)
    .where(eq(invitations.id, data.invitationId))
    .limit(1);
  if (!inv || !inv.published) throw new Error("Invitation not found or not published");

  const [rsvp] = await db
    .insert(rsvps)
    .values({
      invitationId: data.invitationId,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      guests: data.guests ?? 1,
      eventsAttending: data.eventsAttending ?? [],
      message: data.message || null,
      status: "pending",
      respondedAt: new Date(),
    })
    .returning();

  // Track analytics
  await trackEvent({ invitationId: data.invitationId, event: "rsvp_submit" });

  return rsvp;
}

// ━━━ DELETE INVITATION ━━━
export async function deleteInvitation(data: { id: string }): Promise<void> {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  const [inv] = await db
    .select({ userId: invitations.userId })
    .from(invitations)
    .where(eq(invitations.id, data.id));
  if (!inv || inv.userId !== user.id) throw new Error("Forbidden");

  await db.delete(invitations).where(eq(invitations.id, data.id));
}

// ━━━ PAYMENT HELPERS ━━━
function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const hmac = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET);
  hmac.update(`${orderId}|${paymentId}`);
  const expected = hmac.digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  return (
    expectedBuf.length === signatureBuf.length &&
    crypto.timingSafeEqual(expectedBuf, signatureBuf)
  );
}

async function createRazorpayOrder(
  amountInr: number,
  receipt: string
): Promise<{ id: string; amount: number; currency: string }> {
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: amountInr * 100, currency: "INR", receipt }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as any;
    throw new Error(`Razorpay order creation failed: ${err?.error?.description ?? "unknown"}`);
  }
  return res.json() as Promise<{ id: string; amount: number; currency: string }>;
}

// ━━━ CREATE ORDER (server-side Razorpay order) ━━━
export async function createOrder(data: {
  type: "subscription" | "credits" | "template";
  plan?: "starter" | "premium" | "royal";
  packageId?: number;
  templateId?: string;
}) {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error("Payment gateway not configured");
  }

  const planPrices: Record<string, number> = { starter: 2999, premium: 3999, royal: 6999 };
  let amountInr = 0;
  let description = "";

  if (data.type === "subscription") {
    if (!data.plan) throw new Error("Plan is required");
    amountInr = planPrices[data.plan] ?? 0;
    description = `Invitara ${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} Plan`;
  } else if (data.type === "credits") {
    if (!data.packageId) throw new Error("Package ID is required");
    const [pkg] = await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.id, data.packageId));
    if (!pkg) throw new Error("Package not found");
    amountInr = pkg.priceInr;
    description = `${pkg.credits} AI Credits`;
  } else if (data.type === "template") {
    if (!data.templateId) throw new Error("Template ID is required");
    const [tmpl] = await db
      .select({ price: templates.price, name: templates.name })
      .from(templates)
      .where(eq(templates.id, data.templateId));
    if (!tmpl) throw new Error("Template not found");
    amountInr = tmpl.price;
    description = `Template: ${tmpl.name}`;
  }

  if (amountInr <= 0) throw new Error("Invalid order amount");

  const receipt = `rzp_${data.type}_${Date.now().toString(36)}`;
  const order = await createRazorpayOrder(amountInr, receipt);

  return {
    orderId: order.id,
    amount: order.amount, // in paise
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,
    description,
  };
}

// ━━━ PURCHASE PLAN ━━━
export async function purchasePlan(data: {
  plan: "starter" | "premium" | "royal";
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}) {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  if (
    !verifyRazorpaySignature(data.razorpayOrderId, data.razorpayPaymentId, data.razorpaySignature)
  ) {
    throw new Error("Payment verification failed — invalid signature");
  }

  return upgradePlan(user.id, data.plan, data.razorpayPaymentId, "completed");
}

// ━━━ BUY CREDITS ━━━
export async function buyCredits(data: {
  packageId: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}) {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  if (
    !verifyRazorpaySignature(data.razorpayOrderId, data.razorpayPaymentId, data.razorpaySignature)
  ) {
    throw new Error("Payment verification failed — invalid signature");
  }

  return purchaseCredits(user.id, data.packageId, data.razorpayPaymentId, "completed");
}

// ━━━ BUY TEMPLATE ━━━
export async function buyTemplate(data: {
  templateId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}) {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  if (
    !verifyRazorpaySignature(data.razorpayOrderId, data.razorpayPaymentId, data.razorpaySignature)
  ) {
    throw new Error("Payment verification failed — invalid signature");
  }

  return purchaseTemplate(user.id, data.templateId, data.razorpayPaymentId, "completed");
}

// ━━━ PAYMENT HISTORY ━━━
export async function getPaymentHistory() {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");

  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, user.id))
    .orderBy(desc(payments.createdAt))
    .limit(50);
}
