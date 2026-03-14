# Superadmin Dashboard — Design Spec

**Date:** 2026-03-14
**Status:** Approved

## Overview

A dedicated back-office dashboard at `/admin/*` for Invitara superadmins to manage users, invitations, templates, plans, ads, payments, credits, and view platform analytics. Superadmin access is controlled via the `SUPERADMIN_EMAILS` environment variable — no database role column needed.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Admin identification | Env var (`SUPERADMIN_EMAILS`) | Simple, no migration, 1-2 admins expected |
| Plan storage | Database table (dynamic) | Editable from dashboard without deploys |
| Analytics depth | Full suite (cards + charts + funnel + retention + geo + device) | Actionable insights for growth |
| Layout | Separate admin layout with sidebar | Clean separation from customer UI |
| Sections | All 8 requested | Complete back-office coverage |

## 1. Auth & Access Control

### Environment Variable

```
SUPERADMIN_EMAILS=admin@invitara.app,founder@invitara.app
```

### Helper — `app/lib/admin.ts`

```typescript
export function isSuperAdmin(email: string): boolean
```

Checks email against comma-separated `SUPERADMIN_EMAILS` env var. Case-insensitive comparison.

### Route Protection — Server Layout Guard

The current JWT only carries `{ userId }`, and Edge Middleware cannot query the DB to resolve email. Instead of middleware, admin routes are protected via a **server-side layout guard** in `app/admin/layout.tsx`:

1. The layout is a server component that calls `getSession()`
2. If no session or `!isAdmin`, redirect to `/`
3. This runs on every admin page load (server-side, not edge)

`middleware.ts` is updated only to add `/admin` to the protected routes list (requires login). The actual admin-email check happens in the layout.

### Server Actions

All admin server actions (in a new `app/lib/admin-actions.ts`) verify admin status at the top via a shared `requireAdmin()` helper. Defense in depth — even if layout guard is bypassed, actions refuse non-admin callers.

### SafeUser Extension

`SafeUser` type gets a computed `isAdmin: boolean` field, derived from email match at session resolution time. Not stored in DB.

### Input Validation

All admin server actions use Zod schemas for input validation, following the same pattern as auth actions (`registerSchema`, `loginSchema`). Each action has a corresponding schema defined alongside it in `admin-actions.ts`.

## 2. Database Changes

### New Table: `plans`

| Column | Type | Notes |
|--------|------|-------|
| id | varchar(50) PK | `free`, `starter`, `premium`, `royal` |
| name | varchar(100) | Display name |
| price | integer | INR, 0 for free |
| showAds | boolean | default false |
| credits | integer | Bonus credits granted on upgrade |
| maxPublished | integer | 0 = unlimited; consumers map 0 → Infinity |
| maxEvents | integer | 0 = unlimited; consumers map 0 → Infinity |
| maxPhotos | integer | |
| badge | varchar(100) | nullable, e.g. "Most Popular" |
| features | jsonb (string[]) | Feature bullet points |
| sortOrder | integer | Display ordering |
| active | boolean | default true |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Convention:** `0` in maxPublished/maxEvents/maxPhotos means unlimited. The `getPlanLimits()` helper maps `0 → Infinity` for use in application logic (e.g. `canPublish()`). This avoids storing special sentinel values like `-1`.

**Migration strategy:** Create table, seed with current hardcoded `PLANS` values (Royal gets `maxPublished=0`, `maxEvents=0` for unlimited), update `purchases.ts` to read from DB. Cache plans in memory with 60s TTL to avoid per-request queries. Also update `createOrder()` in `actions.ts` to read plan prices from DB instead of hardcoded `planPrices` map.

### New Table: `ads`

| Column | Type | Notes |
|--------|------|-------|
| id | varchar(100) PK | |
| title | varchar(255) | |
| description | text | |
| ctaText | varchar(100) | |
| ctaLink | text | |
| gradient | text | CSS gradient string |
| icon | varchar(50) | Lucide icon name or empty |
| slot | varchar(50) | `hero_banner`, `dashboard_top`, `editor_bottom`, `template_sidebar`, `preview_footer`, `between_events` |
| priority | integer | default 0; higher = shown first when multiple ads match a slot |
| active | boolean | default true |
| impressions | integer | default 0 |
| clicks | integer | default 0 |
| startDate | timestamp | nullable — if set, ad only shows after this date |
| endDate | timestamp | nullable — if set, ad expires after this date |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Migration strategy:** Create table, seed with current hardcoded ad objects from `HomeClient.tsx`, `DashboardPage`, `EditorInner`. Update `ads.ts` to query this table. Remove hardcoded ad objects from components.

### Schema Change: `users` table

Add column:
- `banned` — boolean, default false

**Banned user enforcement:**
1. `validateSession()` in `auth.ts` checks `banned` — if true, returns null (session invalid). This globally blocks all authenticated actions.
2. When an admin bans a user, all active sessions for that user are deleted from the `sessions` table (immediate effect).
3. Login check: `loginUser()` throws "Account suspended" if `banned=true`.
4. No special UI needed — banned users simply can't log in or maintain sessions.

## 3. Route Structure

```
app/admin/
  layout.tsx              — admin sidebar + topbar (separate from public Navigation)
  page.tsx                — analytics overview (default landing)
  users/page.tsx          — user management table
  invitations/page.tsx    — all invitations table
  templates/page.tsx      — template CRUD
  plans/page.tsx          — plan editor
  ads/page.tsx            — ad campaign management
  payments/page.tsx       — transaction history
  credits/page.tsx        — credit package management
```

All pages are client components (`"use client"`) using TanStack Query for data fetching, consistent with the rest of the app.

## 4. Admin Layout

### Sidebar
- Dark matte background matching the theme engine (`bg-foreground text-background`)
- Fixed width: 260px on desktop, collapsible drawer on mobile
- Top: "Invitara Admin" branding with Sparkles icon
- 8 navigation items with Lucide icons:
  - BarChart3 — Overview
  - Users — Users
  - FileText — Invitations
  - Palette — Templates
  - CreditCard — Plans
  - Megaphone — Ads
  - Receipt — Payments
  - Coins — Credits
- Active state: highlighted background with primary color indicator
- Bottom: Admin name display + "Exit to Site" link (arrow icon)

### Topbar
- Breadcrumb: "Admin / [Section Name]"
- Right side: theme toggle (Sun/Moon), admin avatar/name

### Mobile
- Sidebar collapses to hamburger menu
- Topbar stays fixed

## 5. Section Details

### 5.1 Analytics Overview (`/admin` — default page)

**Summary Cards (top row, 6 cards):**
- Total Users (with % change vs last month)
- Active Users This Month (users with at least 1 analytics event)
- Total Revenue (sum of completed payments)
- Total Invitations Created
- Published Invitations
- Total RSVPs Received

**Charts Row 1:**
- Signups Over Time — line chart, last 30 days (from `users.createdAt`)
- Revenue Over Time — area chart, last 30 days (from `payments` where status=completed)

**Charts Row 2:**
- Popular Templates — horizontal bar chart, top 10 (from `invitations.templateId` count)
- Plan Distribution — donut chart (from `users.plan` count)

**Conversion Funnel:**
- Horizontal funnel visualization: Signup → Create Invitation → Publish → Receive RSVP
- Each step shows count and conversion rate to next step
- Data: users count, users with >=1 invitation, users with >=1 published, users with >=1 RSVP

**Retention Table:**
- Cohort-based: users grouped by signup week
- Columns: Week 0 (signup), Week 1, Week 2, Week 3, Week 4
- Cell value: % of cohort users who had any activity (analytics event) in that week
- Color-coded cells (green = high retention, red = low)

**Geographic Breakdown:**
- Pie chart of top 10 countries from `analyticsEvents.country`
- Table below with country, count, percentage

**Device Breakdown:**
- Donut chart from `analyticsEvents.device`
- Segments: Mobile, Desktop, Tablet, Unknown

### 5.2 Users (`/admin/users`)

**Table columns:** Name, Email, Plan (colored badge), Credits, Invitations (count), Joined (relative date), Status (active/banned)

**Filters:**
- Search by name or email (debounced input)
- Filter by plan (multi-select)
- Filter by date range (joined date)
- Toggle: show banned users

**Row actions (dropdown menu):**
- Change Plan — select dropdown with all active plans
- Adjust Credits — modal with +/- input and reason field
- Toggle Ads — on/off
- View Invitations — navigates to invitations page filtered by this user
- Ban/Unban — confirmation dialog

**Pagination:** Server-side, 20 per page

### 5.3 Invitations (`/admin/invitations`)

**Table columns:** Couple (Groom & Bride), Template name, Published (badge), Views, RSVPs, Created date, Owner (email, links to user)

**Filters:**
- Search by couple names or owner email
- Filter by published/unpublished/all
- Filter by template
- Filter by date range

**Row actions:**
- View Live — opens `/invite/[slug]` in new tab (only if published)
- Force Unpublish — confirmation dialog
- Delete — confirmation dialog with warning about data loss

**Pagination:** Server-side, 20 per page

### 5.4 Templates (`/admin/templates`)

**View:** Card grid (default) or table list (toggle)

**Card shows:** Gradient preview (200px height), name, category, price, free/premium badges, active status

**Actions:**
- Add New — full form modal/page
- Edit — opens form pre-filled
- Toggle Active — quick toggle
- Reorder — sort order number input

**Template Form Fields:**
- id (slug, auto-generated from name on create, read-only on edit)
- name, category (dropdown), price (INR), emoji
- description (textarea)
- gradient (text input with live preview)
- colors (6 color pickers: primary, secondary, bg, accent, text, card)
- isFree toggle, isPremium toggle
- sortOrder (number)

### 5.5 Plans (`/admin/plans`)

**View:** Side-by-side cards matching public pricing page layout but with edit controls

**Each plan card shows:**
- All fields editable inline or via modal
- Features as an editable list (add/remove/reorder items)
- Live preview of how the card looks on the public pricing page

**Actions:**
- Edit any field
- Toggle active (deactivated plans hidden from pricing page, existing users unaffected)
- Cannot delete plans (users reference them)

### 5.6 Ads Management (`/admin/ads`)

**Table/card view:** Title, slot, status (active/scheduled/expired/inactive), impressions, clicks, CTR, date range

**Status logic:**
- Active: `active=true` AND (no startDate OR startDate <= now) AND (no endDate OR endDate > now)
- Scheduled: `active=true` AND startDate > now
- Expired: `active=true` AND endDate <= now
- Inactive: `active=false`

**Actions:**
- Create New — form with all ad fields
- Edit — update any field
- Deactivate/Activate — toggle
- Delete — hard delete with confirmation

**Stats per ad:** Impressions, clicks, CTR (calculated), shown as mini sparkline

### 5.7 Payments (`/admin/payments`)

**Table columns:** User (name + email), Type (subscription/credits/template), Amount (INR), Status (colored badge), Razorpay ID, Date

**Filters:**
- By status (completed/pending/failed/refunded)
- By type
- By date range
- Search by user email or Razorpay ID

**Summary cards (top):**
- Total Revenue (completed only)
- This Month's Revenue
- Failed Payments Count
- Average Order Value

**Read-only** — no refund/modify actions. Razorpay dashboard handles disputes.

**Pagination:** Server-side, 25 per page

### 5.8 Credit Packages (`/admin/credits`)

**Table:** Name, Credits, Price (INR), Popular badge, Active status

**Actions:**
- Add New — form modal
- Edit — update name, credits, price, popular toggle
- Toggle Active — deactivated packages hidden from store but past purchases preserved
- No delete — referential integrity

## 6. Server Actions

New file: `app/lib/admin-actions.ts`

Every action starts with:
```typescript
async function requireAdmin() {
  const token = await getTokenFromCookies();
  if (!token) throw new Error("Not authenticated");
  const user = await validateSession(token);
  if (!user) throw new Error("Not authenticated");
  if (!isSuperAdmin(user.email)) throw new Error("Forbidden");
  return user;
}
```

### Actions needed:

**Analytics:**
- `getAdminAnalytics()` — summary cards data
- `getSignupChart(days: number)` — signups per day
- `getRevenueChart(days: number)` — revenue per day
- `getPopularTemplates(limit: number)` — template usage counts
- `getPlanDistribution()` — user count per plan
- `getConversionFunnel()` — funnel step counts
- `getRetentionCohorts(weeks: number)` — cohort retention data
- `getGeographicBreakdown()` — country distribution
- `getDeviceBreakdown()` — device distribution

**Users:**
- `getAdminUsers(filters)` — paginated user list with counts
- `updateUserPlan(userId, plan)` — change user's plan
- `adjustUserCredits(userId, amount, reason)` — add/subtract credits
- `toggleUserAds(userId)` — toggle showAds
- `banUser(userId)` / `unbanUser(userId)` — set banned flag

**Invitations:**
- `getAdminInvitations(filters)` — paginated list with joins
- `adminUnpublish(invitationId)` — force unpublish
- `adminDeleteInvitation(invitationId)` — force delete

**Templates:**
- `getAdminTemplates()` — all templates including inactive
- `createTemplate(data)` — insert new template
- `updateTemplate(id, data)` — update template fields
- `deleteTemplate(id)` — soft delete (active=false)

**Plans:**
- `getAdminPlans()` — all plans from DB
- `updatePlan(id, data)` — update plan fields
- `togglePlanActive(id)` — toggle active

**Ads:**
- `getAdminAds()` — all ads with stats
- `createAd(data)` — insert new ad
- `updateAd(id, data)` — update ad fields
- `deleteAd(id)` — hard delete

**Payments:**
- `getAdminPayments(filters)` — paginated payment list with user join
- `getPaymentSummary()` — revenue totals

**Credit Packages:**
- `getAdminCreditPackages()` — all packages including inactive
- `createCreditPackage(data)` — insert
- `updateCreditPackage(id, data)` — update
- `toggleCreditPackageActive(id)` — toggle

## 7. Query Hooks

New file: `app/lib/admin-queries.ts`

Mirrors the pattern in `queries.ts` — TanStack Query options and mutation hooks for each admin action. Separate file to keep admin concerns isolated.

## 8. UI Patterns

- All tables use `@tanstack/react-table` (already installed) with server-side pagination
- All icons from `lucide-react` — no emojis
- Forms use `@tanstack/react-form` with `zod` validation (existing pattern)
- Color inputs for template editor: native `<input type="color">` with hex display
- Charts use `recharts` (already installed)
- Modals use Radix Dialog (already installed)
- Toast-style feedback for mutations (inline status messages, consistent with existing pattern)
- Follows the OKLCH theme engine — admin pages respect dark/light mode and theme-yellow/orange/pink

## 9. Files to Create

| File | Purpose |
|------|---------|
| `app/lib/admin.ts` | `isSuperAdmin()` helper |
| `app/lib/admin-actions.ts` | All admin server actions |
| `app/lib/admin-queries.ts` | TanStack Query hooks for admin |
| `app/admin/layout.tsx` | Admin sidebar + topbar layout |
| `app/admin/page.tsx` | Analytics overview |
| `app/admin/users/page.tsx` | User management |
| `app/admin/invitations/page.tsx` | Invitation management |
| `app/admin/templates/page.tsx` | Template CRUD |
| `app/admin/plans/page.tsx` | Plan editor |
| `app/admin/ads/page.tsx` | Ad campaign management |
| `app/admin/payments/page.tsx` | Payment history |
| `app/admin/credits/page.tsx` | Credit package management |

## 10. Files to Modify

| File | Change |
|------|--------|
| `app/lib/schema.ts` | Add `plans` table, `ads` table, `banned` column on users |
| `app/lib/env.ts` | Add `SUPERADMIN_EMAILS` |
| `app/lib/auth.ts` | Add `isAdmin` to `SafeUser`, compute from env |
| `app/lib/purchases.ts` | Read plans from DB instead of hardcoded array, keep `PLAN_LIMITS` as DB-driven |
| `app/lib/ads.ts` | Read ads from DB instead of hardcoded slots |
| `middleware.ts` | Add `/admin/*` route protection |
| `app/components/Navigation.tsx` | Show "Admin" link for superadmins |
| Components using hardcoded ads | Read from DB-driven ad system |

## 11. Performance Notes

- **Retention cohort queries:** Add composite index `(userId, createdAt)` on `analyticsEvents` table to support the weekly cohort query. Cache results for 5 minutes since retention data doesn't change frequently.
- **Plan caching:** Plans table cached in-memory with 60s TTL via a simple `let cache` + timestamp pattern. No external cache needed.
- **Analytics queries:** Summary card queries should use `count()` aggregations, not `select *`. Date-range queries use the existing `analytics_created_idx` index.

## 12. Admin Audit Log

New table `admin_audit_log`:

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| adminId | uuid FK → users | Who performed the action |
| action | varchar(100) | e.g. `ban_user`, `change_plan`, `adjust_credits`, `force_unpublish`, `update_plan`, `create_ad` |
| targetType | varchar(50) | `user`, `invitation`, `template`, `plan`, `ad`, `credit_package` |
| targetId | varchar(255) | ID of the affected entity |
| details | jsonb | Action-specific metadata (old value, new value, reason) |
| createdAt | timestamp | |

All sensitive admin actions log to this table. The admin dashboard does not expose a UI for viewing audit logs in v1, but the data is captured for accountability and can be queried directly.

## 13. Migration Plan

1. Add `plans` table, seed with current `PLANS` data
2. Add `ads` table, seed with current hardcoded ads
3. Add `banned` boolean to `users` table (default false)
4. No destructive changes — additive only
