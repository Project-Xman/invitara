"use server";

import { cookies } from "next/headers";
import { db } from "./drizzle";
import {
  users,
  invitations,
  templates,
  events,
  rsvps,
  payments,
  sessions,
  creditPackages,
  creditTransactions,
  analyticsEvents,
  ads,
  plans,
  adminAuditLog,
} from "./schema";
import {
  eq,
  and,
  desc,
  asc,
  sql,
  count,
  gte,
  lte,
  or,
  ilike,
  isNull,
} from "drizzle-orm";
import { validateSession } from "./auth";
import { isSuperAdmin } from "./admin";
import { addCredits, debitCredits } from "./credits";
import { invalidatePlanCache } from "./purchases";
import { z } from "zod";

// ━━━ HELPERS ━━━

async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("invitara_token")?.value ?? null;
}

async function requireAdmin() {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");
  if (!isSuperAdmin(user.email)) throw new Error("Forbidden");
  return user;
}

async function logAudit(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>
) {
  await db.insert(adminAuditLog).values({
    adminId,
    action,
    targetType,
    targetId,
    details: details ?? {},
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANALYTICS (9 actions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAdminAnalytics() {
  await requireAdmin();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalUsersResult] = await db
    .select({ value: count() })
    .from(users);

  const [activeThisMonthResult] = await db
    .select({ value: sql<number>`count(distinct ${analyticsEvents.userId})` })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, startOfMonth));

  const [totalRevenueResult] = await db
    .select({ value: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)` })
    .from(payments)
    .where(eq(payments.status, "completed"));

  const [totalInvitationsResult] = await db
    .select({ value: count() })
    .from(invitations);

  const [publishedInvitationsResult] = await db
    .select({ value: count() })
    .from(invitations)
    .where(eq(invitations.published, true));

  const [totalRsvpsResult] = await db
    .select({ value: count() })
    .from(rsvps);

  return {
    totalUsers: totalUsersResult.value,
    activeThisMonth: Number(activeThisMonthResult.value),
    totalRevenue: Number(totalRevenueResult.value),
    totalInvitations: totalInvitationsResult.value,
    publishedInvitations: publishedInvitationsResult.value,
    totalRsvps: totalRsvpsResult.value,
  };
}

export async function getSignupChart(data: { days: number }) {
  await requireAdmin();

  const days = Math.min(Math.max(data.days, 1), 365);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      date: sql<string>`to_char(${users.createdAt}, 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(users)
    .where(gte(users.createdAt, since))
    .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${users.createdAt}, 'YYYY-MM-DD')`);

  // Fill in missing dates with 0
  const result: { date: string; count: number }[] = [];
  const dateMap = new Map(rows.map((r) => [r.date, r.count]));
  for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: dateMap.get(key) ?? 0 });
  }
  return result;
}

export async function getRevenueChart(data: { days: number }) {
  await requireAdmin();

  const days = Math.min(Math.max(data.days, 1), 365);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      date: sql<string>`to_char(${payments.createdAt}, 'YYYY-MM-DD')`,
      revenue: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)`,
    })
    .from(payments)
    .where(and(eq(payments.status, "completed"), gte(payments.createdAt, since)))
    .groupBy(sql`to_char(${payments.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${payments.createdAt}, 'YYYY-MM-DD')`);

  const result: { date: string; revenue: number }[] = [];
  const dateMap = new Map(rows.map((r) => [r.date, Number(r.revenue)]));
  for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, revenue: dateMap.get(key) ?? 0 });
  }
  return result;
}

export async function getPopularTemplates(data: { limit: number }) {
  await requireAdmin();

  const lim = Math.min(Math.max(data.limit, 1), 100);

  const rows = await db
    .select({
      templateId: invitations.templateId,
      templateName: templates.name,
      count: count(),
    })
    .from(invitations)
    .innerJoin(templates, eq(invitations.templateId, templates.id))
    .groupBy(invitations.templateId, templates.name)
    .orderBy(desc(count()))
    .limit(lim);

  return rows;
}

export async function getPlanDistribution() {
  await requireAdmin();

  const rows = await db
    .select({
      plan: users.plan,
      count: count(),
    })
    .from(users)
    .groupBy(users.plan)
    .orderBy(desc(count()));

  return rows;
}

export async function getConversionFunnel() {
  await requireAdmin();

  const [signupsResult] = await db.select({ value: count() }).from(users);

  const [createdResult] = await db
    .select({ value: sql<number>`count(distinct ${invitations.userId})` })
    .from(invitations);

  const [publishedResult] = await db
    .select({ value: sql<number>`count(distinct ${invitations.userId})` })
    .from(invitations)
    .where(eq(invitations.published, true));

  const [receivedRsvpResult] = await db
    .select({
      value: sql<number>`count(distinct ${invitations.userId})`,
    })
    .from(invitations)
    .innerJoin(rsvps, eq(invitations.id, rsvps.invitationId));

  return {
    signups: signupsResult.value,
    created: Number(createdResult.value),
    published: Number(publishedResult.value),
    receivedRsvp: Number(receivedRsvpResult.value),
  };
}

export async function getRetentionCohorts(data: { weeks: number }) {
  await requireAdmin();

  const weeks = Math.min(Math.max(data.weeks, 1), 52);

  // Get cohort data: users grouped by signup week, with activity in subsequent weeks
  const rows = await db.execute(sql`
    WITH cohorts AS (
      SELECT
        id,
        date_trunc('week', ${users.createdAt}) AS cohort_week
      FROM ${users}
      WHERE ${users.createdAt} >= now() - interval '1 week' * ${weeks}
    ),
    activity AS (
      SELECT
        c.cohort_week,
        floor(extract(epoch FROM (date_trunc('week', ${analyticsEvents.createdAt}) - c.cohort_week)) / 604800)::int AS week_number,
        count(DISTINCT c.id) AS active_users
      FROM cohorts c
      INNER JOIN ${analyticsEvents} ON ${analyticsEvents.userId} = c.id
      WHERE ${analyticsEvents.createdAt} >= c.cohort_week
      GROUP BY c.cohort_week, week_number
    ),
    cohort_sizes AS (
      SELECT cohort_week, count(*) AS size
      FROM cohorts
      GROUP BY cohort_week
    )
    SELECT
      to_char(cs.cohort_week, 'YYYY-MM-DD') AS cohort_week,
      cs.size AS cohort_size,
      a.week_number,
      a.active_users
    FROM cohort_sizes cs
    LEFT JOIN activity a ON a.cohort_week = cs.cohort_week
    ORDER BY cs.cohort_week, a.week_number
  `);

  // Transform into structured cohort data
  const cohortMap = new Map<
    string,
    { cohortWeek: string; cohortSize: number; retention: Record<number, number> }
  >();

  type CohortRow = {
    cohort_week: string;
    cohort_size: number;
    week_number: number | null;
    active_users: number | null;
  };
  for (const row of rows as unknown as CohortRow[]) {
    const key = row.cohort_week;
    if (!cohortMap.has(key)) {
      cohortMap.set(key, {
        cohortWeek: key,
        cohortSize: Number(row.cohort_size),
        retention: {},
      });
    }
    if (row.week_number !== null && row.active_users !== null) {
      cohortMap.get(key)!.retention[row.week_number] = Number(row.active_users);
    }
  }

  return Array.from(cohortMap.values());
}

export async function getGeographicBreakdown() {
  await requireAdmin();

  const rows = await db
    .select({
      country: analyticsEvents.country,
      count: count(),
    })
    .from(analyticsEvents)
    .where(sql`${analyticsEvents.country} IS NOT NULL`)
    .groupBy(analyticsEvents.country)
    .orderBy(desc(count()))
    .limit(10);

  return rows as { country: string; count: number }[];
}

export async function getDeviceBreakdown() {
  await requireAdmin();

  const rows = await db
    .select({
      device: analyticsEvents.device,
      count: count(),
    })
    .from(analyticsEvents)
    .where(sql`${analyticsEvents.device} IS NOT NULL`)
    .groupBy(analyticsEvents.device)
    .orderBy(desc(count()));

  return rows as { device: string; count: number }[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USERS (6 actions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const adminUsersSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  search: z.string().optional(),
  plan: z.string().optional(),
  showBanned: z.boolean().optional(),
});

export async function getAdminUsers(data: {
  page: number;
  pageSize: number;
  search?: string;
  plan?: string;
  showBanned?: boolean;
}) {
  await requireAdmin();

  const parsed = adminUsersSchema.parse(data);
  const { page, pageSize, search, plan, showBanned } = parsed;
  const offset = (page - 1) * pageSize;

  const conditions: ReturnType<typeof eq>[] = [];

  if (search) {
    conditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )!
    );
  }

  if (plan) {
    conditions.push(eq(users.plan, plan as "free" | "starter" | "premium" | "royal"));
  }

  if (!showBanned) {
    conditions.push(eq(users.banned, false));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ value: count() })
    .from(users)
    .where(where);

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      plan: users.plan,
      credits: users.credits,
      showAds: users.showAds,
      banned: users.banned,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      invitationCount: sql<number>`(
        SELECT count(*) FROM ${invitations} WHERE ${invitations.userId} = ${users.id}
      )`,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    data: rows,
    total: totalResult.value,
    page,
    pageSize,
  };
}

export async function updateUserPlan(data: { userId: string; plan: string }) {
  const admin = await requireAdmin();

  const validPlans = ["free", "starter", "premium", "royal"] as const;
  if (!validPlans.includes(data.plan as (typeof validPlans)[number])) {
    throw new Error("Invalid plan");
  }

  await db
    .update(users)
    .set({
      plan: data.plan as "free" | "starter" | "premium" | "royal",
      updatedAt: new Date(),
    })
    .where(eq(users.id, data.userId));

  await logAudit(admin.id, "update_plan", "user", data.userId, { plan: data.plan });
}

export async function adjustUserCredits(data: {
  userId: string;
  amount: number;
  reason: string;
}) {
  const admin = await requireAdmin();

  const schema = z.object({
    userId: z.string().uuid(),
    amount: z.number().int().refine((n) => n !== 0, "Amount cannot be zero"),
    reason: z.string().min(1).max(255),
  });
  const parsed = schema.parse(data);

  if (parsed.amount > 0) {
    await addCredits(parsed.userId, parsed.amount, `Admin: ${parsed.reason}`);
  } else {
    const success = await debitCredits(
      parsed.userId,
      Math.abs(parsed.amount),
      `Admin: ${parsed.reason}`
    );
    if (!success) throw new Error("Insufficient credits for debit");
  }

  await logAudit(admin.id, "adjust_credits", "user", parsed.userId, {
    amount: parsed.amount,
    reason: parsed.reason,
  });
}

export async function toggleUserAds(data: { userId: string }) {
  const admin = await requireAdmin();

  const [user] = await db
    .select({ showAds: users.showAds })
    .from(users)
    .where(eq(users.id, data.userId));
  if (!user) throw new Error("User not found");

  const newValue = !user.showAds;
  await db
    .update(users)
    .set({ showAds: newValue, updatedAt: new Date() })
    .where(eq(users.id, data.userId));

  await logAudit(admin.id, "toggle_ads", "user", data.userId, { showAds: newValue });
}

export async function banUser(data: { userId: string }) {
  const admin = await requireAdmin();

  await db
    .update(users)
    .set({ banned: true, updatedAt: new Date() })
    .where(eq(users.id, data.userId));

  // Delete all sessions to force logout
  await db.delete(sessions).where(eq(sessions.userId, data.userId));

  await logAudit(admin.id, "ban_user", "user", data.userId);
}

export async function unbanUser(data: { userId: string }) {
  const admin = await requireAdmin();

  await db
    .update(users)
    .set({ banned: false, updatedAt: new Date() })
    .where(eq(users.id, data.userId));

  await logAudit(admin.id, "unban_user", "user", data.userId);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INVITATIONS (3 actions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAdminInvitations(data: {
  page: number;
  pageSize: number;
  search?: string;
  published?: string;
  templateId?: string;
}) {
  await requireAdmin();

  const page = Math.max(data.page, 1);
  const pageSize = Math.min(Math.max(data.pageSize, 1), 100);
  const offset = (page - 1) * pageSize;

  const conditions: ReturnType<typeof eq>[] = [];

  if (data.search) {
    conditions.push(
      or(
        ilike(invitations.groomName, `%${data.search}%`),
        ilike(invitations.brideName, `%${data.search}%`),
        ilike(invitations.slug, `%${data.search}%`),
        ilike(users.email, `%${data.search}%`)
      )!
    );
  }

  if (data.published === "true") {
    conditions.push(eq(invitations.published, true));
  } else if (data.published === "false") {
    conditions.push(eq(invitations.published, false));
  }

  if (data.templateId) {
    conditions.push(eq(invitations.templateId, data.templateId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ value: count() })
    .from(invitations)
    .innerJoin(users, eq(invitations.userId, users.id))
    .where(where);

  const rows = await db
    .select({
      id: invitations.id,
      slug: invitations.slug,
      groomName: invitations.groomName,
      brideName: invitations.brideName,
      templateId: invitations.templateId,
      published: invitations.published,
      viewCount: invitations.viewCount,
      shareCount: invitations.shareCount,
      createdAt: invitations.createdAt,
      userEmail: users.email,
      userName: users.name,
    })
    .from(invitations)
    .innerJoin(users, eq(invitations.userId, users.id))
    .where(where)
    .orderBy(desc(invitations.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    data: rows,
    total: totalResult.value,
    page,
    pageSize,
  };
}

export async function adminUnpublish(data: { invitationId: string }) {
  const admin = await requireAdmin();

  await db
    .update(invitations)
    .set({ published: false, updatedAt: new Date() })
    .where(eq(invitations.id, data.invitationId));

  await logAudit(admin.id, "unpublish", "invitation", data.invitationId);
}

export async function adminDeleteInvitation(data: { invitationId: string }) {
  const admin = await requireAdmin();

  await db.delete(invitations).where(eq(invitations.id, data.invitationId));

  await logAudit(admin.id, "delete", "invitation", data.invitationId);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEMPLATES (4 actions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAdminTemplates() {
  await requireAdmin();

  return db.select().from(templates).orderBy(asc(templates.sortOrder));
}

const createTemplateSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  price: z.number().int().min(0),
  emoji: z.string().min(1).max(10),
  description: z.string().min(1),
  gradient: z.string().min(1),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    bg: z.string(),
    accent: z.string(),
    text: z.string(),
    card: z.string(),
  }),
  isFree: z.boolean(),
  isPremium: z.boolean(),
  sortOrder: z.number().int(),
});

export async function createTemplate(data: {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  description: string;
  gradient: string;
  colors: Record<string, string>;
  isFree: boolean;
  isPremium: boolean;
  sortOrder: number;
}) {
  const admin = await requireAdmin();
  const parsed = createTemplateSchema.parse(data);

  await db.insert(templates).values({
    id: parsed.id,
    name: parsed.name,
    category: parsed.category,
    price: parsed.price,
    emoji: parsed.emoji,
    description: parsed.description,
    gradient: parsed.gradient,
    colors: parsed.colors as {
      primary: string;
      secondary: string;
      bg: string;
      accent: string;
      text: string;
      card: string;
    },
    isFree: parsed.isFree,
    isPremium: parsed.isPremium,
    sortOrder: parsed.sortOrder,
    active: true,
  });

  await logAudit(admin.id, "create", "template", parsed.id, { name: parsed.name });
}

export async function updateTemplate(data: {
  id: string;
  name?: string;
  category?: string;
  price?: number;
  emoji?: string;
  description?: string;
  gradient?: string;
  colors?: Record<string, string>;
  isFree?: boolean;
  isPremium?: boolean;
  sortOrder?: number;
  active?: boolean;
}) {
  const admin = await requireAdmin();

  const { id, ...fields } = data;

  // Build update object with only provided fields
  const update: Record<string, unknown> = {};
  if (fields.name !== undefined) update.name = fields.name;
  if (fields.category !== undefined) update.category = fields.category;
  if (fields.price !== undefined) update.price = fields.price;
  if (fields.emoji !== undefined) update.emoji = fields.emoji;
  if (fields.description !== undefined) update.description = fields.description;
  if (fields.gradient !== undefined) update.gradient = fields.gradient;
  if (fields.colors !== undefined) update.colors = fields.colors;
  if (fields.isFree !== undefined) update.isFree = fields.isFree;
  if (fields.isPremium !== undefined) update.isPremium = fields.isPremium;
  if (fields.sortOrder !== undefined) update.sortOrder = fields.sortOrder;
  if (fields.active !== undefined) update.active = fields.active;

  if (Object.keys(update).length === 0) return;

  await db.update(templates).set(update).where(eq(templates.id, id));

  await logAudit(admin.id, "update", "template", id, update);
}

export async function deleteTemplate(data: { id: string }) {
  const admin = await requireAdmin();

  // Soft delete
  await db
    .update(templates)
    .set({ active: false })
    .where(eq(templates.id, data.id));

  await logAudit(admin.id, "soft_delete", "template", data.id);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLANS (3 actions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAdminPlans() {
  await requireAdmin();

  return db.select().from(plans).orderBy(asc(plans.sortOrder));
}

export async function updatePlan(data: {
  id: string;
  name?: string;
  price?: number;
  showAds?: boolean;
  credits?: number;
  maxPublished?: number;
  maxEvents?: number;
  maxPhotos?: number;
  badge?: string;
  features?: string[];
  sortOrder?: number;
}) {
  const admin = await requireAdmin();

  const { id, ...fields } = data;

  const update: Record<string, unknown> = {};
  if (fields.name !== undefined) update.name = fields.name;
  if (fields.price !== undefined) update.price = fields.price;
  if (fields.showAds !== undefined) update.showAds = fields.showAds;
  if (fields.credits !== undefined) update.credits = fields.credits;
  if (fields.maxPublished !== undefined) update.maxPublished = fields.maxPublished;
  if (fields.maxEvents !== undefined) update.maxEvents = fields.maxEvents;
  if (fields.maxPhotos !== undefined) update.maxPhotos = fields.maxPhotos;
  if (fields.badge !== undefined) update.badge = fields.badge;
  if (fields.features !== undefined) update.features = fields.features;
  if (fields.sortOrder !== undefined) update.sortOrder = fields.sortOrder;
  update.updatedAt = new Date();

  if (Object.keys(update).length <= 1) return; // only updatedAt

  await db.update(plans).set(update).where(eq(plans.id, id));
  invalidatePlanCache();

  await logAudit(admin.id, "update", "plan", id, update);
}

export async function togglePlanActive(data: { id: string }) {
  const admin = await requireAdmin();

  const [plan] = await db
    .select({ active: plans.active })
    .from(plans)
    .where(eq(plans.id, data.id));
  if (!plan) throw new Error("Plan not found");

  const newValue = !plan.active;
  await db
    .update(plans)
    .set({ active: newValue, updatedAt: new Date() })
    .where(eq(plans.id, data.id));
  invalidatePlanCache();

  await logAudit(admin.id, "toggle_active", "plan", data.id, { active: newValue });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADS (4 actions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAdminAds() {
  await requireAdmin();

  return db.select().from(ads).orderBy(asc(ads.slot), desc(ads.priority));
}

const createAdSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  ctaText: z.string().min(1).max(100),
  ctaLink: z.string().url(),
  gradient: z.string().min(1),
  icon: z.string().max(50).default(""),
  slot: z.string().min(1).max(50),
  priority: z.number().int().default(0),
  active: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function createAd(data: {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  gradient: string;
  icon?: string;
  slot: string;
  priority?: number;
  active?: boolean;
  startDate?: string;
  endDate?: string;
}) {
  const admin = await requireAdmin();
  const parsed = createAdSchema.parse(data);

  await db.insert(ads).values({
    id: parsed.id,
    title: parsed.title,
    description: parsed.description,
    ctaText: parsed.ctaText,
    ctaLink: parsed.ctaLink,
    gradient: parsed.gradient,
    icon: parsed.icon,
    slot: parsed.slot,
    priority: parsed.priority,
    active: parsed.active,
    startDate: parsed.startDate ? new Date(parsed.startDate) : null,
    endDate: parsed.endDate ? new Date(parsed.endDate) : null,
  });

  await logAudit(admin.id, "create", "ad", parsed.id, { title: parsed.title });
}

export async function updateAd(data: {
  id: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  gradient?: string;
  icon?: string;
  slot?: string;
  priority?: number;
  active?: boolean;
  startDate?: string;
  endDate?: string;
}) {
  const admin = await requireAdmin();

  const { id, ...fields } = data;

  const update: Record<string, unknown> = {};
  if (fields.title !== undefined) update.title = fields.title;
  if (fields.description !== undefined) update.description = fields.description;
  if (fields.ctaText !== undefined) update.ctaText = fields.ctaText;
  if (fields.ctaLink !== undefined) update.ctaLink = fields.ctaLink;
  if (fields.gradient !== undefined) update.gradient = fields.gradient;
  if (fields.icon !== undefined) update.icon = fields.icon;
  if (fields.slot !== undefined) update.slot = fields.slot;
  if (fields.priority !== undefined) update.priority = fields.priority;
  if (fields.active !== undefined) update.active = fields.active;
  if (fields.startDate !== undefined) update.startDate = new Date(fields.startDate);
  if (fields.endDate !== undefined) update.endDate = new Date(fields.endDate);
  update.updatedAt = new Date();

  if (Object.keys(update).length <= 1) return;

  await db.update(ads).set(update).where(eq(ads.id, id));

  await logAudit(admin.id, "update", "ad", id, update);
}

export async function deleteAd(data: { id: string }) {
  const admin = await requireAdmin();

  // Hard delete
  await db.delete(ads).where(eq(ads.id, data.id));

  await logAudit(admin.id, "delete", "ad", data.id);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAYMENTS (2 actions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAdminPayments(data: {
  page: number;
  pageSize: number;
  status?: string;
  type?: string;
  search?: string;
}) {
  await requireAdmin();

  const page = Math.max(data.page, 1);
  const pageSize = Math.min(Math.max(data.pageSize, 1), 100);
  const offset = (page - 1) * pageSize;

  const conditions: ReturnType<typeof eq>[] = [];

  if (data.status) {
    conditions.push(
      eq(payments.status, data.status as "pending" | "completed" | "failed" | "refunded")
    );
  }

  if (data.type) {
    conditions.push(
      eq(payments.type, data.type as "template" | "credits" | "subscription")
    );
  }

  if (data.search) {
    conditions.push(
      or(ilike(users.name, `%${data.search}%`), ilike(users.email, `%${data.search}%`))!
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ value: count() })
    .from(payments)
    .innerJoin(users, eq(payments.userId, users.id))
    .where(where);

  const rows = await db
    .select({
      id: payments.id,
      userId: payments.userId,
      type: payments.type,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      stripePaymentId: payments.stripePaymentId,
      razorpayPaymentId: payments.razorpayPaymentId,
      metadata: payments.metadata,
      createdAt: payments.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(payments)
    .innerJoin(users, eq(payments.userId, users.id))
    .where(where)
    .orderBy(desc(payments.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    data: rows,
    total: totalResult.value,
    page,
    pageSize,
  };
}

export async function getPaymentSummary() {
  await requireAdmin();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalRevenueResult] = await db
    .select({ value: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)` })
    .from(payments)
    .where(eq(payments.status, "completed"));

  const [thisMonthRevenueResult] = await db
    .select({ value: sql<number>`coalesce(sum(${payments.amount}::numeric), 0)` })
    .from(payments)
    .where(
      and(eq(payments.status, "completed"), gte(payments.createdAt, startOfMonth))
    );

  const [failedCountResult] = await db
    .select({ value: count() })
    .from(payments)
    .where(eq(payments.status, "failed"));

  const [avgOrderResult] = await db
    .select({ value: sql<number>`coalesce(avg(${payments.amount}::numeric), 0)` })
    .from(payments)
    .where(eq(payments.status, "completed"));

  return {
    totalRevenue: Number(totalRevenueResult.value),
    thisMonthRevenue: Number(thisMonthRevenueResult.value),
    failedCount: failedCountResult.value,
    avgOrderValue: Number(Number(avgOrderResult.value).toFixed(2)),
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CREDIT PACKAGES (4 actions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAdminCreditPackages() {
  await requireAdmin();

  return db.select().from(creditPackages);
}

const createCreditPackageSchema = z.object({
  name: z.string().min(1).max(100),
  credits: z.number().int().min(1),
  priceInr: z.number().int().min(0),
  popular: z.boolean(),
});

export async function createCreditPackage(data: {
  name: string;
  credits: number;
  priceInr: number;
  popular: boolean;
}) {
  const admin = await requireAdmin();
  const parsed = createCreditPackageSchema.parse(data);

  const [pkg] = await db
    .insert(creditPackages)
    .values({
      name: parsed.name,
      credits: parsed.credits,
      priceInr: parsed.priceInr,
      popular: parsed.popular,
      active: true,
    })
    .returning();

  await logAudit(admin.id, "create", "credit_package", String(pkg.id), {
    name: parsed.name,
    credits: parsed.credits,
  });

  return pkg;
}

export async function updateCreditPackage(data: {
  id: number;
  name?: string;
  credits?: number;
  priceInr?: number;
  popular?: boolean;
  active?: boolean;
}) {
  const admin = await requireAdmin();

  const { id, ...fields } = data;

  const update: Record<string, unknown> = {};
  if (fields.name !== undefined) update.name = fields.name;
  if (fields.credits !== undefined) update.credits = fields.credits;
  if (fields.priceInr !== undefined) update.priceInr = fields.priceInr;
  if (fields.popular !== undefined) update.popular = fields.popular;
  if (fields.active !== undefined) update.active = fields.active;

  if (Object.keys(update).length === 0) return;

  await db.update(creditPackages).set(update).where(eq(creditPackages.id, id));

  await logAudit(admin.id, "update", "credit_package", String(id), update);
}

export async function toggleCreditPackageActive(data: { id: number }) {
  const admin = await requireAdmin();

  const [pkg] = await db
    .select({ active: creditPackages.active })
    .from(creditPackages)
    .where(eq(creditPackages.id, data.id));
  if (!pkg) throw new Error("Credit package not found");

  const newValue = !pkg.active;
  await db
    .update(creditPackages)
    .set({ active: newValue })
    .where(eq(creditPackages.id, data.id));

  await logAudit(admin.id, "toggle_active", "credit_package", String(data.id), {
    active: newValue,
  });
}
