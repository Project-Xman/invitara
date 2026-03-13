import { createServerFn } from "@tanstack/start";
import { db } from "./drizzle";
import { users, templates, invitations, events, rsvps } from "./schema";
import { eq, desc } from "drizzle-orm";
import { registerUser, loginUser, createSession, validateSession, toSafeUser, type SafeUser } from "./auth";
import { getCredits, getCreditHistory, addCredits, debitCredits, DEFAULT_CREDIT_PACKAGES, CREDIT_COSTS } from "./credits";
import { generateDesign } from "./ai-generate";
import { trackEvent, getInvitationAnalytics, getDailyViews, getUserAnalyticsSummary } from "./analytics";
import { getUserTemplates, userOwnsTemplate, purchaseTemplate, upgradePlan, PLANS } from "./purchases";
import { getAdForSlot, trackAdImpression, shouldShowAds, type AdSlot } from "./ads";
import { z } from "zod";

// Helper: extract token from cookie header
function getTokenFromHeaders(headers: Headers): string | null {
  const cookie = headers.get("cookie") || "";
  const match = cookie.match(/invitara_token=([^;]+)/);
  return match?.[1] || null;
}

// ━━━ AUTH SERVER FUNCTIONS ━━━
export const getSession = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  const token = getTokenFromHeaders(request.headers);
  if (!token) return null;
  const user = await validateSession(token);
  if (!user) return null;
  return toSafeUser(user);
});

export const register = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string(), email: z.string(), password: z.string(), phone: z.string().optional() }))
  .handler(async ({ data }) => {
    const user = await registerUser(data);
    const { token } = await createSession(user.id);
    return { user: toSafeUser(user), token };
  });

export const login = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string(), password: z.string() }))
  .handler(async ({ data }) => {
    const user = await loginUser(data);
    const { token } = await createSession(user.id);
    return { user: toSafeUser(user), token };
  });

// ━━━ TEMPLATE SERVER FUNCTIONS ━━━
export const getTemplates = createServerFn({ method: "GET" })
  .validator(z.object({ category: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    const all = await db.select().from(templates).where(eq(templates.active, true)).orderBy(templates.sortOrder);
    if (data?.category && data.category !== "All") {
      return all.filter((t) => t.category === data.category);
    }
    return all;
  });

export const getMyTemplates = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  const token = getTokenFromHeaders(request.headers);
  if (!token) return [];
  const user = await validateSession(token);
  if (!user) return [];
  return getUserTemplates(user.id);
});

// ━━━ INVITATION SERVER FUNCTIONS ━━━
export const getMyInvitations = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  const token = getTokenFromHeaders(request.headers);
  if (!token) return [];
  const user = await validateSession(token);
  if (!user) return [];
  return db.select().from(invitations).where(eq(invitations.userId, user.id)).orderBy(desc(invitations.updatedAt));
});

export const getInvitation = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const [inv] = await db.select().from(invitations).where(eq(invitations.id, data.id));
    return inv || null;
  });

export const saveInvitation = createServerFn({ method: "POST" })
  .validator(z.object({
    id: z.string().optional(),
    templateId: z.string(),
    groomName: z.string(),
    brideName: z.string(),
    groomFamily: z.string().optional(),
    brideFamily: z.string().optional(),
    blessingFrom: z.string().optional(),
    mantra: z.string().optional(),
    message: z.string().optional(),
    hashtag: z.string().optional(),
    weddingDate: z.string().optional(),
    venue: z.string().optional(),
    mapLink: z.string().optional(),
    instagramLink: z.string().optional(),
    whatsappNumber: z.string().optional(),
  }))
  .handler(async ({ data, request }) => {
    const token = getTokenFromHeaders(request.headers);
    if (!token) throw new Error("Not authenticated");
    const user = await validateSession(token);
    if (!user) throw new Error("Not authenticated");

    const slug = `${data.groomName.toLowerCase()}-weds-${data.brideName.toLowerCase()}-${Date.now().toString(36)}`;

    if (data.id) {
      await db.update(invitations).set({ ...data, updatedAt: new Date() }).where(eq(invitations.id, data.id));
      return { id: data.id };
    } else {
      const [inv] = await db.insert(invitations).values({
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
      }).returning();
      return { id: inv.id, slug: inv.slug };
    }
  });

// ━━━ EVENT SERVER FUNCTIONS ━━━
export const getEvents = createServerFn({ method: "GET" })
  .validator(z.object({ invitationId: z.string() }))
  .handler(async ({ data }) => {
    return db.select().from(events).where(eq(events.invitationId, data.invitationId)).orderBy(events.sortOrder);
  });

export const addEvent = createServerFn({ method: "POST" })
  .validator(z.object({ invitationId: z.string(), name: z.string(), date: z.string().optional(), venue: z.string().optional(), time: z.string().optional(), icon: z.string().optional(), color: z.string().optional() }))
  .handler(async ({ data }) => {
    const [ev] = await db.insert(events).values({
      invitationId: data.invitationId,
      name: data.name,
      date: data.date || "TBD",
      venue: data.venue || "TBD",
      time: data.time || "TBD",
      icon: data.icon || "🎉",
      color: data.color || "#D4A853",
    }).returning();
    return ev;
  });

export const removeEvent = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    await db.delete(events).where(eq(events.id, data.id));
  });

// ━━━ RSVP SERVER FUNCTIONS ━━━
export const getRsvps = createServerFn({ method: "GET" })
  .validator(z.object({ invitationId: z.string() }))
  .handler(async ({ data }) => {
    return db.select().from(rsvps).where(eq(rsvps.invitationId, data.invitationId)).orderBy(desc(rsvps.createdAt));
  });

export const updateRsvpStatus = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number(), status: z.enum(["attending", "pending", "declined"]) }))
  .handler(async ({ data }) => {
    await db.update(rsvps).set({ status: data.status }).where(eq(rsvps.id, data.id));
  });

// ━━━ CREDIT SERVER FUNCTIONS ━━━
export const getMyCredits = createServerFn({ method: "GET" }).handler(async ({ request }) => {
  const token = getTokenFromHeaders(request.headers);
  if (!token) return { credits: 0, history: [] };
  const user = await validateSession(token);
  if (!user) return { credits: 0, history: [] };
  const credits = await getCredits(user.id);
  const history = await getCreditHistory(user.id);
  return { credits, history };
});

export const getCreditPacks = createServerFn({ method: "GET" }).handler(async () => {
  return DEFAULT_CREDIT_PACKAGES;
});

// ━━━ AI SERVER FUNCTIONS ━━━
export const generateAIDesign = createServerFn({ method: "POST" })
  .validator(z.object({ prompt: z.string(), style: z.string().optional(), invitationId: z.string().optional() }))
  .handler(async ({ data, request }) => {
    const token = getTokenFromHeaders(request.headers);
    if (!token) throw new Error("Not authenticated");
    const user = await validateSession(token);
    if (!user) throw new Error("Not authenticated");
    return generateDesign({ userId: user.id, ...data });
  });

// ━━━ ANALYTICS SERVER FUNCTIONS ━━━
export const getAnalytics = createServerFn({ method: "GET" })
  .validator(z.object({ invitationId: z.string() }))
  .handler(async ({ data }) => {
    const summary = await getInvitationAnalytics(data.invitationId);
    const daily = await getDailyViews(data.invitationId);
    return { summary, daily };
  });

// ━━━ AD SERVER FUNCTIONS ━━━
export const getAd = createServerFn({ method: "GET" })
  .validator(z.object({ slot: z.string() }).optional())
  .handler(async ({ data, request }) => {
    const token = getTokenFromHeaders(request.headers);
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
    if (ad && userId) {
      await trackAdImpression(userId, ad.slot);
    }
    return ad;
  });

// ━━━ PLAN/PRICING ━━━
export const getPlans = createServerFn({ method: "GET" }).handler(async () => PLANS);
