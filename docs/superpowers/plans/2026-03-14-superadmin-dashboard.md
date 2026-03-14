# Superadmin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete superadmin back-office dashboard at `/admin/*` with 8 management sections, DB-driven plans/ads, and full platform analytics.

**Architecture:** Server layout guard for admin auth (env-var based), DB-driven plans and ads tables replacing hardcoded arrays, TanStack Query for data fetching, recharts for analytics visualization. All admin server actions in a dedicated `admin-actions.ts` with Zod validation and audit logging.

**Tech Stack:** Next.js 15, Drizzle ORM (PostgreSQL), TanStack Query/Table/Form, Zod, Recharts, Lucide React, Radix Dialog

**Spec:** `docs/superpowers/specs/2026-03-14-superadmin-dashboard-design.md`

---

## Chunk 1: Infrastructure & Schema

### Task 1: Add SUPERADMIN_EMAILS to env config

**Files:**
- Modify: `app/lib/env.ts:14-38`

- [ ] **Step 1: Add env var**

In `app/lib/env.ts`, add to the `env` object after the CRON_SECRET line:

```typescript
// Admin
SUPERADMIN_EMAILS: process.env.SUPERADMIN_EMAILS ?? "",
```

- [ ] **Step 2: Add to .env.example (NOT .env)**

Add to `.env.example` (never commit `.env`):
```
SUPERADMIN_EMAILS=admin@invitara.app
```

Also add to your local `.env` (not committed):
```
SUPERADMIN_EMAILS=your-email@example.com
```

- [ ] **Step 3: Commit**

```bash
git add app/lib/env.ts
git commit -m "feat(admin): add SUPERADMIN_EMAILS env var"
```

---

### Task 2: Create admin helper

**Files:**
- Create: `app/lib/admin.ts`

- [ ] **Step 1: Create isSuperAdmin helper**

```typescript
import { env } from "./env";

/**
 * Check if an email is in the SUPERADMIN_EMAILS list.
 * Case-insensitive comparison.
 */
export function isSuperAdmin(email: string): boolean {
  if (!env.SUPERADMIN_EMAILS) return false;
  const adminEmails = env.SUPERADMIN_EMAILS
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/admin.ts
git commit -m "feat(admin): add isSuperAdmin helper"
```

---

### Task 3: Add isAdmin to SafeUser and extend auth

**Files:**
- Modify: `app/lib/auth.ts:216-239`

- [ ] **Step 1: Import admin helper**

At the top of `auth.ts`, add:
```typescript
import { isSuperAdmin } from "./admin";
```

- [ ] **Step 2: Add isAdmin to SafeUser type**

Update `SafeUser` type (search for `export type SafeUser`):
```typescript
export type SafeUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  plan: "free" | "starter" | "premium" | "royal";
  credits: number;
  showAds: boolean;
  isAdmin: boolean;
  createdAt: Date;
};
```

- [ ] **Step 3: Update toSafeUser to compute isAdmin**

Update `toSafeUser` function (search for `export function toSafeUser`):
```typescript
export function toSafeUser(user: typeof users.$inferSelect): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    plan: user.plan,
    credits: user.credits,
    showAds: user.showAds,
    isAdmin: isSuperAdmin(user.email),
    createdAt: user.createdAt,
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add app/lib/auth.ts
git commit -m "feat(admin): add isAdmin computed field to SafeUser"
```

---

### Task 4: Add plans, ads, admin_audit_log tables and banned column to schema

**Files:**
- Modify: `app/lib/schema.ts`

- [ ] **Step 1: Add plans table after templates table**

After the `templates` table definition (around line 114), add:

```typescript
// ━━━ PLANS ━━━
export const plans = pgTable("plans", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  price: integer("price").notNull().default(0),
  showAds: boolean("show_ads").notNull().default(false),
  credits: integer("credits").notNull().default(0),
  maxPublished: integer("max_published").notNull().default(1),
  maxEvents: integer("max_events").notNull().default(2),
  maxPhotos: integer("max_photos").notNull().default(3),
  badge: varchar("badge", { length: 100 }),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

- [ ] **Step 2: Add ads table**

```typescript
// ━━━ ADS ━━━
export const ads = pgTable("ads", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  ctaText: varchar("cta_text", { length: 100 }).notNull(),
  ctaLink: text("cta_link").notNull(),
  gradient: text("gradient").notNull(),
  icon: varchar("icon", { length: 50 }).notNull().default(""),
  slot: varchar("slot", { length: 50 }).notNull(),
  priority: integer("priority").notNull().default(0),
  active: boolean("active").notNull().default(true),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

- [ ] **Step 3: Add admin_audit_log table**

```typescript
// ━━━ ADMIN AUDIT LOG ━━━
export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: serial("id").primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 100 }).notNull(),
    targetType: varchar("target_type", { length: 50 }).notNull(),
    targetId: varchar("target_id", { length: 255 }).notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("audit_admin_idx").on(t.adminId), index("audit_created_idx").on(t.createdAt)]
);
```

- [ ] **Step 4: Add banned column to users table**

In the `users` table definition, add after `showAds`:
```typescript
banned: boolean("banned").notNull().default(false),
```

- [ ] **Step 5: Add composite index on analyticsEvents**

In the `analyticsEvents` table indexes, add:
```typescript
index("analytics_user_created_idx").on(t.userId, t.createdAt),
```

- [ ] **Step 6: Commit**

```bash
git add app/lib/schema.ts
git commit -m "feat(admin): add plans, ads, admin_audit_log tables and banned column"
```

---

### Task 5: Generate and run migration

**Files:**
- Drizzle migration files (auto-generated)

- [ ] **Step 1: Generate migration**

```bash
cd "/Volumes/Vinu 1TB SS/Programs/invitara"
bun run db:generate
```

- [ ] **Step 2: Run migration**

```bash
bun run db:migrate
```

- [ ] **Step 3: Seed plans table**

Create a seed script or add to existing `seed.ts`. Insert the 4 plans:

```typescript
// In app/lib/seed.ts — add plans seeding
await db.insert(plans).values([
  {
    id: "free", name: "Free", price: 0, showAds: true, credits: 3,
    maxPublished: 1, maxEvents: 2, maxPhotos: 3, sortOrder: 0,
    features: ["2 Free Templates", "1 Published Invitation", "Up to 2 Events", "Basic Photo Gallery", "RSVP via WhatsApp", "Invitara Branding", "Ads Shown", "3 AI Credits"],
  },
  {
    id: "starter", name: "Starter", price: 2999, showAds: false, credits: 5,
    maxPublished: 3, maxEvents: 5, maxPhotos: 8, sortOrder: 1,
    features: ["Purchase Templates Individually", "Up to 3 Published Invitations", "Up to 5 Events", "Photo Gallery (8 photos)", "RSVP Dashboard", "No Ads", "Remove Branding", "5 Bonus AI Credits"],
  },
  {
    id: "premium", name: "Premium", price: 3999, showAds: false, credits: 15,
    maxPublished: 10, maxEvents: 0, maxPhotos: 20, badge: "Most Popular", sortOrder: 2,
    features: ["ALL Templates Included", "Up to 10 Published Invitations", "Unlimited Events", "Photo Gallery (20 photos)", "RSVP Dashboard + Analytics", "No Ads", "Custom Domain", "Background Music", "15 Bonus AI Credits", "Priority Support"],
  },
  {
    id: "royal", name: "Royal", price: 6999, showAds: false, credits: 50,
    maxPublished: 0, maxEvents: 0, maxPhotos: 50, sortOrder: 3,
    features: ["Everything in Premium", "Unlimited Published Invitations", "Custom Design Tweaks", "Video Background", "Multi-language Support", "Guest Management CRM", "QR Code Invites", "50 Bonus AI Credits", "Concierge Setup", "Dedicated Manager"],
  },
]).onConflictDoNothing();
```

Seed ads table with existing hardcoded ads from `ads.ts`:

```typescript
await db.insert(ads).values([
  { id: "upgrade-premium", slot: "hero_banner", title: "Go Premium", description: "Remove ads, unlock all templates, get AI design credits & custom domain.", ctaText: "Upgrade Now", ctaLink: "/pricing", gradient: "linear-gradient(135deg, #A67C2E 0%, #D4A853 50%, #FFD466 100%)", icon: "", priority: 10 },
  { id: "ai-credits", slot: "editor_bottom", title: "AI-Powered Designs", description: "Let AI generate unique color palettes and design suggestions for your invite.", ctaText: "Try AI Design", ctaLink: "/ai-generate", gradient: "linear-gradient(135deg, #4A3A6B 0%, #7A6AAB 50%, #D4A853 100%)", icon: "", priority: 8 },
  { id: "credit-sale", slot: "dashboard_top", title: "Credit Sale!", description: "Get 15 AI generation credits for just \u20B9249.", ctaText: "Buy Credits", ctaLink: "/account", gradient: "linear-gradient(135deg, #C73866 0%, #E8668E 50%, #D4A853 100%)", icon: "", priority: 7 },
  { id: "share-invite", slot: "preview_footer", title: "Love your invite?", description: "Share Invitara with friends & earn 2 free AI credits per referral!", ctaText: "Share & Earn", ctaLink: "/account", gradient: "linear-gradient(135deg, #1A4A3A 0%, #2A7A5A 50%, #D4A853 100%)", icon: "", priority: 5 },
  { id: "template-new", slot: "template_sidebar", title: "New: Cherry Blossom", description: "Our newest template is here \u2014 golden cherry blossoms for spring weddings.", ctaText: "Preview Template", ctaLink: "/templates", gradient: "linear-gradient(135deg, #E8668E 0%, #FF99B5 50%, #D4A853 100%)", icon: "", priority: 6 },
  { id: "between-events-upgrade", slot: "between_events", title: "Remove this ad", description: "Upgrade to Premium for an ad-free experience.", ctaText: "Go Ad-Free", ctaLink: "/pricing", gradient: "linear-gradient(135deg, #D4A853 0%, #FFE49A 100%)", icon: "", priority: 3 },
]).onConflictDoNothing();
```

- [ ] **Step 4: Commit**

```bash
git add drizzle/ app/lib/seed.ts
git commit -m "feat(admin): migration and seed for plans, ads, audit_log tables"
```

---

### Task 6: Update purchases.ts to read plans from DB

**Files:**
- Modify: `app/lib/purchases.ts`

- [ ] **Step 1: Add plans table import and cache**

Replace the hardcoded `PLAN_LIMITS` and `PLANS` with DB-driven versions:

```typescript
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

// ━━━ GET PLAN LIMITS ━━━
export async function getPlanLimits(planId: string) {
  const plans = await getPlansFromDB();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return { maxPublished: 1, maxEvents: 2, maxPhotos: 3 };
  return {
    maxPublished: plan.maxPublished === 0 ? Infinity : plan.maxPublished,
    maxEvents: plan.maxEvents === 0 ? Infinity : plan.maxEvents,
    maxPhotos: plan.maxPhotos === 0 ? Infinity : plan.maxPhotos,
  };
}
```

- [ ] **Step 2: Update canPublish to use async getPlanLimits**

```typescript
export async function canPublish(userId: string): Promise<{ allowed: boolean; current: number; max: number }> {
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
  if (!user) return { allowed: false, current: 0, max: 0 };

  const limits = await getPlanLimits(user.plan);
  const max = limits.maxPublished;

  if (max === Infinity) return { allowed: true, current: 0, max };

  const published = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(and(eq(invitations.userId, userId), eq(invitations.published, true)));

  return { allowed: published.length < max, current: published.length, max };
}
```

- [ ] **Step 3: Remove old hardcoded PLAN_LIMITS and PLANS constants**

Delete the old `PLAN_LIMITS` and `PLANS` constants. Replace with a function that reads from DB:

```typescript
export async function getPlans() {
  const plans = await getPlansFromDB();
  return plans.filter((p) => p.active).map((p) => ({
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
```

- [ ] **Step 4: Update upgradePlan to read prices/credits from DB**

Replace the hardcoded `planPrices` and `planCredits` maps in `upgradePlan()` (search for `export async function upgradePlan`):

```typescript
export async function upgradePlan(
  userId: string,
  plan: "starter" | "premium" | "royal",
  paymentId: string,
  status: "pending" | "completed" = "completed"
) {
  const plans = await getPlansFromDB();
  const planData = plans.find((p) => p.id === plan);
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
    const [user] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));
    const newCredits = (user?.credits || 0) + planData.credits;
    await db
      .update(users)
      .set({ plan, showAds: false, credits: newCredits, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  return { plan, bonusCredits: planData.credits };
}
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/purchases.ts
git commit -m "feat(admin): DB-driven plans replacing hardcoded PLANS array"
```

---

### Task 7: Update ads.ts to read from DB

**Files:**
- Modify: `app/lib/ads.ts`

- [ ] **Step 1: Replace hardcoded INTERNAL_ADS with DB query**

```typescript
import { db } from "./drizzle";
import { adImpressions, ads } from "./schema";
import { eq, and, lte, gte, or, isNull } from "drizzle-orm";

export type AdSlot =
  | "hero_banner"
  | "template_sidebar"
  | "editor_bottom"
  | "dashboard_top"
  | "preview_footer"
  | "between_events";

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

export async function getAdForSlot(slot: AdSlot, excludeIds: string[] = []): Promise<InternalAd | null> {
  const now = new Date();
  const allAds = await db
    .select()
    .from(ads)
    .where(
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

  // Add randomness
  if (candidates.length > 1 && Math.random() > 0.7) {
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return { ...picked, slot: picked.slot as AdSlot };
  }
  return { ...candidates[0], slot: candidates[0].slot as AdSlot };
}
```

- [ ] **Step 2: Keep trackAdImpression and trackAdClick unchanged**

These functions already write to `adImpressions` and don't depend on the hardcoded array.

- [ ] **Step 3: Commit**

```bash
git add app/lib/ads.ts
git commit -m "feat(admin): DB-driven ads replacing hardcoded INTERNAL_ADS"
```

---

### Task 8: Update actions.ts for DB-driven plans and async ads

**Files:**
- Modify: `app/lib/actions.ts`

- [ ] **Step 1: Update getPlans action to use DB**

Replace the import and usage. Change:
```typescript
import { ..., PLANS } from "./purchases";
```
to:
```typescript
import { ..., getPlans } from "./purchases";
```

Update `getPlans` action:
```typescript
export async function getPlans() {
  const { getPlans: fetchPlans } = await import("./purchases");
  return fetchPlans();
}
```

- [ ] **Step 2: Update createOrder to read plan prices from DB**

Replace the hardcoded `planPrices` map in `createOrder()` (around line 655):
```typescript
if (data.type === "subscription") {
  if (!data.plan) throw new Error("Plan is required");
  const { getPlansFromDB } = await import("./purchases");
  const allPlans = await getPlansFromDB();
  const plan = allPlans.find((p) => p.id === data.plan);
  if (!plan) throw new Error("Plan not found");
  amountInr = plan.price;
  description = `Invitara ${plan.name} Plan`;
}
```

- [ ] **Step 3: Update getAd to use async getAdForSlot**

The `getAdForSlot` function is now async (DB query). Update the `getAd` action:
```typescript
export async function getAd(data?: { slot?: string }) {
  // ... existing auth checks ...
  if (!showAds) return null;
  const ad = await getAdForSlot((data?.slot || "hero_banner") as AdSlot);
  if (ad) {
    await trackAdImpression(userId, ad.slot, ad.id);
  }
  return ad;
}
```

- [ ] **Step 4: Update banned user checks in auth**

In `app/lib/auth.ts`, update `validateSession` (search for `export async function validateSession`) to check `banned`:
```typescript
// After fetching user in validateSession:
if (user.banned) return null;
```

In `loginUser` (search for `export async function loginUser`):
```typescript
// After password check, before creating session:
if (user.banned) throw new Error("Account suspended. Contact support.");
```

**Note:** The `banUser` admin action (Task 11) must also delete all sessions for the banned user:
```typescript
await db.delete(sessions).where(eq(sessions.userId, userId));
```

- [ ] **Step 5: Update queries.ts staleTime for plans**

In `app/lib/queries.ts`, update `plansQueryOptions` (search for `plansQueryOptions`):
```typescript
export const plansQueryOptions = () =>
  queryOptions({ queryKey: ["plans"], queryFn: () => actions.getPlans(), staleTime: 60_000 });
```

Changed from `Infinity` to `60_000` (60s) since plans are now DB-driven and editable.

- [ ] **Step 6: Commit**

```bash
git add app/lib/actions.ts app/lib/auth.ts app/lib/queries.ts
git commit -m "feat(admin): DB-driven plan prices, async ads, banned checks in actions"
```

---

### Task 9: Update middleware for admin routes

**Files:**
- Modify: `middleware.ts:5`

- [ ] **Step 1: Add /admin to protected paths**

```typescript
const PROTECTED_PATHS = ["/dashboard", "/editor", "/account", "/admin"];
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat(admin): add /admin to protected routes in middleware"
```

---

### Task 10: Show Admin link in Navigation

**Files:**
- Modify: `app/components/Navigation.tsx`

- [ ] **Step 1: Add admin link conditionally**

In the `navLinks` array, add after account:
```typescript
...(user?.isAdmin ? [{ href: "/admin", l: "Admin" }] : []),
```

- [ ] **Step 2: Commit**

```bash
git add app/components/Navigation.tsx
git commit -m "feat(admin): show Admin nav link for superadmins"
```

---

## Chunk 2: Admin Layout & Server Actions

### Task 11: Create admin server actions

**Files:**
- Create: `app/lib/admin-actions.ts`

- [ ] **Step 1: Create admin-actions.ts with requireAdmin and all actions**

This is a large file. Create `app/lib/admin-actions.ts` with `"use server"` directive.

**Shared helpers:**

```typescript
"use server";

import { cookies } from "next/headers";
import { db } from "./drizzle";
import { users, invitations, templates, events, rsvps, payments, sessions,
         creditPackages, creditTransactions, analyticsEvents, ads, plans, adminAuditLog } from "./schema";
import { eq, and, desc, sql, count, gte, lte, like, or, ilike } from "drizzle-orm";
import { validateSession } from "./auth";
import { isSuperAdmin } from "./admin";
import { addCredits, debitCredits } from "./credits";
import { invalidatePlanCache } from "./purchases";
import { z } from "zod";

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

async function logAudit(adminId: string, action: string, targetType: string, targetId: string, details?: Record<string, unknown>) {
  await db.insert(adminAuditLog).values({ adminId, action, targetType, targetId, details: details ?? {} });
}
```

**Key implementation details for mutations:**

`banUser` must delete sessions:
```typescript
export async function banUser(data: { userId: string }) {
  const admin = await requireAdmin();
  await db.update(users).set({ banned: true, updatedAt: new Date() }).where(eq(users.id, data.userId));
  await db.delete(sessions).where(eq(sessions.userId, data.userId));
  await logAudit(admin.id, "ban_user", "user", data.userId);
}
```

`adjustUserCredits` must use existing credit system:
```typescript
export async function adjustUserCredits(data: { userId: string; amount: number; reason: string }) {
  const admin = await requireAdmin();
  if (data.amount > 0) {
    await addCredits(data.userId, data.amount, data.reason);
  } else {
    await debitCredits(data.userId, Math.abs(data.amount), data.reason);
  }
  await logAudit(admin.id, "adjust_credits", "user", data.userId, { amount: data.amount, reason: data.reason });
}
```

`updatePlan` must invalidate cache:
```typescript
export async function updatePlan(data: { id: string; /* ... fields */ }) {
  const admin = await requireAdmin();
  await db.update(plans).set({ ...data, updatedAt: new Date() }).where(eq(plans.id, data.id));
  invalidatePlanCache();
  await logAudit(admin.id, "update_plan", "plan", data.id, data);
}
```

**Paginated list actions pattern:**
```typescript
// All list actions accept: { page: number; pageSize: number; search?: string; filters? }
// All list actions return: { data: T[]; total: number; page: number; pageSize: number }
```

**Full list of actions to implement (all with Zod input schemas):**
1. Analytics: `getAdminAnalytics`, `getSignupChart`, `getRevenueChart`, `getPopularTemplates`, `getPlanDistribution`, `getConversionFunnel`, `getRetentionCohorts`, `getGeographicBreakdown`, `getDeviceBreakdown`
2. Users: `getAdminUsers`, `updateUserPlan`, `adjustUserCredits`, `toggleUserAds`, `banUser`, `unbanUser`
3. Invitations: `getAdminInvitations`, `adminUnpublish`, `adminDeleteInvitation`
4. Templates: `getAdminTemplates`, `createTemplate`, `updateTemplate`, `deleteTemplate` (soft)
5. Plans: `getAdminPlans`, `updatePlan`, `togglePlanActive`
6. Ads: `getAdminAds`, `createAd`, `updateAd`, `deleteAd` (hard)
7. Payments: `getAdminPayments`, `getPaymentSummary`
8. Credit Packages: `getAdminCreditPackages`, `createCreditPackage`, `updateCreditPackage`, `toggleCreditPackageActive`

- [ ] **Step 2: Commit**

```bash
git add app/lib/admin-actions.ts
git commit -m "feat(admin): all admin server actions with audit logging"
```

---

### Task 12: Create admin query hooks

**Files:**
- Create: `app/lib/admin-queries.ts`

- [ ] **Step 1: Create TanStack Query hooks for all admin actions**

Follow the exact pattern from `app/lib/queries.ts`:
- `queryOptions()` factories for read operations
- `useMutation()` hooks for write operations
- Proper `queryKey` namespacing with `["admin", ...]`
- `onSuccess` invalidation of related queries

- [ ] **Step 2: Commit**

```bash
git add app/lib/admin-queries.ts
git commit -m "feat(admin): TanStack Query hooks for admin actions"
```

---

### Task 13: Create admin layout

**Files:**
- Create: `app/admin/layout.tsx`

- [ ] **Step 1: Create server layout with auth guard**

```typescript
import { redirect } from "next/navigation";
import { getSession } from "~/lib/actions";
import { AdminShell } from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user || !user.isAdmin) redirect("/");
  return <AdminShell user={user}>{children}</AdminShell>;
}
```

- [ ] **Step 2: Create AdminShell client component**

Create `app/admin/AdminShell.tsx` — the sidebar + topbar chrome:
- Sidebar: 260px fixed, dark bg, 8 nav items with Lucide icons, active state, "Exit to Site" link
- Topbar: breadcrumb, theme toggle
- Mobile: hamburger drawer
- All using the OKLCH theme engine tokens

- [ ] **Step 3: Commit**

```bash
git add app/admin/layout.tsx app/admin/AdminShell.tsx
git commit -m "feat(admin): admin layout with sidebar, topbar, and auth guard"
```

---

## Chunk 3: Admin Pages — Analytics & Users

### Task 14: Analytics overview page (`/admin`)

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Build analytics overview**

Client component with:
- 6 summary stat cards (total users, active, revenue, invitations, published, RSVPs)
- Signups line chart + Revenue area chart (recharts)
- Popular templates bar chart + Plan distribution donut
- Conversion funnel visualization (custom component)
- Retention cohort table (color-coded cells)
- Geographic pie chart + Device donut chart

All data fetched via admin query hooks.

- [ ] **Step 2: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat(admin): analytics overview page with charts and funnel"
```

---

### Task 15: Users management page (`/admin/users`)

**Files:**
- Create: `app/admin/users/page.tsx`

- [ ] **Step 1: Build users table**

Client component with:
- TanStack Table with server-side pagination (20/page)
- Search input (debounced), plan filter, date range, banned toggle
- Row action dropdown: change plan, adjust credits modal, toggle ads, view invitations link, ban/unban with confirmation dialog
- Colored plan badges, relative dates

- [ ] **Step 2: Commit**

```bash
git add app/admin/users/page.tsx
git commit -m "feat(admin): users management page with filters and actions"
```

---

## Chunk 4: Admin Pages — Invitations, Templates, Plans

### Task 16: Invitations management page (`/admin/invitations`)

**Files:**
- Create: `app/admin/invitations/page.tsx`

- [ ] **Step 1: Build invitations table**

Server-side paginated table with search, published/template/date filters. Row actions: view live, force unpublish, delete with confirmation.

- [ ] **Step 2: Commit**

```bash
git add app/admin/invitations/page.tsx
git commit -m "feat(admin): invitations management page"
```

---

### Task 17: Templates management page (`/admin/templates`)

**Files:**
- Create: `app/admin/templates/page.tsx`

- [ ] **Step 1: Build template CRUD**

Card grid view with gradient previews. Add/Edit form modal with: name, category, price, emoji, description, gradient (with live preview), 6 color pickers, isFree/isPremium toggles, sortOrder. Toggle active, reorder.

- [ ] **Step 2: Commit**

```bash
git add app/admin/templates/page.tsx
git commit -m "feat(admin): templates CRUD management page"
```

---

### Task 18: Plans editor page (`/admin/plans`)

**Files:**
- Create: `app/admin/plans/page.tsx`

- [ ] **Step 1: Build plan cards editor**

Side-by-side plan cards (matching pricing page layout). Each card: editable fields via modal, features as editable list, live preview. Toggle active.

- [ ] **Step 2: Commit**

```bash
git add app/admin/plans/page.tsx
git commit -m "feat(admin): plans editor page"
```

---

## Chunk 5: Admin Pages — Ads, Payments, Credits

### Task 19: Ads management page (`/admin/ads`)

**Files:**
- Create: `app/admin/ads/page.tsx`

- [ ] **Step 1: Build ads management**

Table/card view with status badges (active/scheduled/expired/inactive). Create/edit form modal with all ad fields. Stats per ad: impressions, clicks, CTR. Deactivate/activate toggle, hard delete with confirmation.

- [ ] **Step 2: Commit**

```bash
git add app/admin/ads/page.tsx
git commit -m "feat(admin): ads management page with stats"
```

---

### Task 20: Payments page (`/admin/payments`)

**Files:**
- Create: `app/admin/payments/page.tsx`

- [ ] **Step 1: Build payments table**

Summary cards (total revenue, this month, failed count, avg order value). Server-side paginated table with status/type/date filters and search. Read-only.

- [ ] **Step 2: Commit**

```bash
git add app/admin/payments/page.tsx
git commit -m "feat(admin): payments history page with revenue summary"
```

---

### Task 21: Credit packages page (`/admin/credits`)

**Files:**
- Create: `app/admin/credits/page.tsx`

- [ ] **Step 1: Build credit packages management**

Table with add/edit modal form. Toggle active. No delete (referential integrity).

- [ ] **Step 2: Commit**

```bash
git add app/admin/credits/page.tsx
git commit -m "feat(admin): credit packages management page"
```

---

## Chunk 6: Integration & Cleanup

### Task 22: Update components using hardcoded ads

**Files:**
- Modify: `app/HomeClient.tsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/editor/EditorInner.tsx`

- [ ] **Step 1: Remove hardcoded ad objects from components**

These components currently pass hardcoded `ad={{...}}` objects to `<AdBanner>`. Update them to fetch ads from DB via the existing `getAd` action (which now queries the DB). The `AdBanner` component already accepts a dynamic ad prop — we just need the parent components to fetch from DB instead of hardcoding.

- [ ] **Step 2: Commit**

```bash
git add app/HomeClient.tsx app/dashboard/page.tsx app/editor/EditorInner.tsx
git commit -m "feat(admin): remove hardcoded ads, use DB-driven ad system"
```

---

### Task 23: Final build verification

- [ ] **Step 1: Run build**

```bash
cd "/Volumes/Vinu 1TB SS/Programs/invitara"
bun run build
```

Expected: Compiled successfully

- [ ] **Step 2: Fix any type/build errors**

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(admin): superadmin dashboard complete"
```
