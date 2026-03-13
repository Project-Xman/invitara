import { db } from "./drizzle";
import { analyticsEvents, invitations } from "./schema";
import { eq, sql, and, gte, lte, count } from "drizzle-orm";

type AnalyticsEvent = "page_view" | "template_view" | "invite_view" | "invite_share" | "rsvp_submit" | "link_click" | "qr_scan" | "ad_impression" | "ad_click";

export async function trackEvent(data: {
  invitationId?: string;
  userId?: string;
  event: AnalyticsEvent;
  metadata?: Record<string, unknown>;
  ip?: string;
  ua?: string;
  referrer?: string;
}) {
  await db.insert(analyticsEvents).values({
    invitationId: data.invitationId,
    userId: data.userId,
    event: data.event,
    metadata: data.metadata || {},
    ipAddress: data.ip,
    userAgent: data.ua,
    referrer: data.referrer,
  });

  // Increment view/share counts on invitation
  if (data.invitationId) {
    if (data.event === "invite_view") {
      await db.update(invitations).set({ viewCount: sql`${invitations.viewCount} + 1` }).where(eq(invitations.id, data.invitationId));
    } else if (data.event === "invite_share") {
      await db.update(invitations).set({ shareCount: sql`${invitations.shareCount} + 1` }).where(eq(invitations.id, data.invitationId));
    }
  }
}

export async function getInvitationAnalytics(invitationId: string, days = 30) {
  const since = new Date(Date.now() - days * 86400000);
  const rows = await db
    .select({ event: analyticsEvents.event, count: count() })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.invitationId, invitationId), gte(analyticsEvents.createdAt, since)))
    .groupBy(analyticsEvents.event);

  const result: Record<string, number> = {};
  for (const r of rows) result[r.event] = r.count;
  return result;
}

export async function getDailyViews(invitationId: string, days = 14) {
  const since = new Date(Date.now() - days * 86400000);
  return db
    .select({
      date: sql<string>`DATE(${analyticsEvents.createdAt})`,
      views: count(),
    })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.invitationId, invitationId),
      eq(analyticsEvents.event, "invite_view"),
      gte(analyticsEvents.createdAt, since)
    ))
    .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
    .orderBy(sql`DATE(${analyticsEvents.createdAt})`);
}

export async function getUserAnalyticsSummary(userId: string) {
  const userInvites = await db.select().from(invitations).where(eq(invitations.userId, userId));
  let totalViews = 0, totalShares = 0, totalRsvps = 0;
  for (const inv of userInvites) {
    totalViews += inv.viewCount;
    totalShares += inv.shareCount;
  }
  return { totalInvitations: userInvites.length, totalViews, totalShares };
}
