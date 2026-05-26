# Invitara — Production Readiness Gap Analysis

**Date:** 2026-05-27
**Stack observed:** Next.js App Router + Drizzle ORM + PostgreSQL + Razorpay + Vercel Blob + Resend
**Scope:** Complete digital wedding card SaaS for Indian market (primary) + global NRI

> Note: README claims TanStack Start but actual code is Next.js (middleware.ts, app/ App Router, API routes). Doc rot — fix.

---

## P0 — Blockers (cannot ship without)

### 1. Zero automated tests
- **Found:** No `*.test.ts`, no `vitest.config`, no `jest.config`, no `playwright.config`.
- **Risk:** Payment webhook regressions silently break revenue. Slug collisions, RSVP duplication, plan upgrade race conditions undetected.
- **Fix:** Vitest unit tests for `lib/auth.ts`, `lib/purchases.ts`, `lib/credits.ts`, webhook signature verification. Playwright e2e for signup → buy plan → create invite → RSVP flow.

### 2. Rate limit not serverless-safe
- **Found:** `app/lib/rate-limit.ts` exists (1.7KB — too small for distributed). Likely in-memory Map.
- **Risk:** On Vercel/serverless each function instance has own memory. Bypass trivial. RSVP form spam, brute-force login, webhook replay.
- **Fix:** Upstash Redis + `@upstash/ratelimit`. Apply per IP on `/api/upload`, `/auth/*`, public RSVP endpoint, webhook idempotency keys.

### 3. No webhook idempotency
- **Found:** `api/webhooks/razorpay/route.ts` inserts payment row but no `razorpayPaymentId` unique check before granting plan/credits.
- **Risk:** Razorpay retries on 5xx. Double credit grant, double plan upgrade possible.
- **Fix:** Unique constraint on `payments.razorpayPaymentId` + `ON CONFLICT DO NOTHING` + check before granting access.

### 4. No CAPTCHA on public endpoints
- **Found:** No `recaptcha`/`hcaptcha`/`turnstile` in deps. RSVP form, login, register, password reset all unprotected.
- **Risk:** Bot RSVP spam ruins guest count. Credential stuffing.
- **Fix:** Cloudflare Turnstile (free, no UI friction) on register, login, forgot-password, public RSVP submit.

### 5. No monitoring / error tracking
- **Found:** No Sentry, PostHog, Datadog, LogRocket. Only `console.log` in webhooks.
- **Risk:** Production errors invisible. Payment failures untraced. Can't diagnose user-reported bugs.
- **Fix:** Sentry (errors + performance), PostHog (product analytics), Uptime monitoring (BetterStack/Healthchecks).

### 6. Missing global-error.tsx + not-found.tsx
- **Found:** `app/error.tsx` + `app/loading.tsx` exist. `app/global-error.tsx`, `app/not-found.tsx` missing.
- **Risk:** Root layout crashes show Next.js default white screen. 404s unbranded.
- **Fix:** Add both files with branded fallback UI + Sentry capture.

### 7. SEO basics missing
- **Found:** No `app/sitemap.ts`, no `app/robots.ts`. Metadata exists on some pages but no Open Graph image generator for invites.
- **Risk:** Templates not indexed. Shared invite links on WhatsApp/FB show blank preview = lower share conversion.
- **Fix:** `sitemap.ts` (templates + landing + pricing), `robots.ts`, `opengraph-image.tsx` per invite slug using couple names + photo.

---

## P1 — Critical features missing for wedding card market

### 8. Phone OTP login
- **Found:** Email-only auth.
- **Why critical:** Indian market — 60%+ users prefer phone OTP. WhatsApp-first audience.
- **Fix:** MSG91/Twilio/Firebase Auth OTP. Add `phoneVerified` column. Allow phone OR email signup.

### 9. Social OAuth
- **Found:** No Google/Facebook/Apple login.
- **Fix:** NextAuth.js or Auth.js. Google Sign-In + Apple (App Store requirement if mobile app later).

### 10. WhatsApp Business API integration
- **Found:** `whatsappNumber` field in schema. `ShareModal.tsx` likely just opens `wa.me` link.
- **Why critical:** Indian weddings = WhatsApp invitations. Couples want bulk send to 200+ guests.
- **Fix:** WATI / Gupshup / Interakt / Meta WhatsApp Cloud API. Send templated invite via API with personalized guest link.

### 11. Guest list management
- **Found:** RSVP table exists but no guest list import.
- **Missing:**
  - CSV/Excel bulk guest import (name, phone, side, party)
  - Per-guest personalized link (`/invite/[slug]/[guestId]`)
  - Guest tagging (groom-side, bride-side, family, friends, colleagues)
  - Bulk send via WhatsApp/Email
  - Open tracking per guest
  - Plus-one management
- **Fix:** Add `guests` table referencing `invitations`. CSV import endpoint. Personalized slug variants.

### 12. Multi-event flow
- **Found:** Single `weddingDate` + `venue` field. Schema indicates one event per invitation.
- **Why critical:** Indian weddings = engagement, mehendi, haldi, sangeet, baraat, wedding, reception. Each needs own date/venue/dress code.
- **Fix:** `events` table (invitation_id, type, date, venue, dress_code, map_link). Editor UI to add/reorder events.

### 13. Add to calendar (.ics)
- **Found:** No calendar export endpoint.
- **Fix:** `/api/invitations/[slug]/calendar.ics` generating multi-event VCALENDAR. Button on invite page.

### 14. QR code generation
- **Found:** Schema has `qr_scan` analytics event but unclear if QR auto-generated.
- **Fix:** Use `qrcode` lib. Generate on publish. Embed in printable invite PDF + downloadable PNG.

### 15. Gift registry / cash gifts (Shagun)
- **Found:** No UPI/account number field, no gift tracking.
- **Why critical:** Indian weddings — couples want UPI ID, account, or curated registry (Amazon/Flipkart wishlist).
- **Fix:** `gift_options` table. UPI QR code on invite page. Optional Razorpay direct payment to couple with thank-you note.

### 16. Guestbook / wishes wall
- **Found:** RSVP only — no comments/wishes.
- **Fix:** `wishes` table (invitation_id, guest_name, message, approved). Moderation toggle. Display feed on invite page.

### 17. Live streaming for remote guests
- **Found:** No livestream URL field.
- **Why critical:** NRI families need to attend remote.
- **Fix:** YouTube Live / Zoom / Jitsi URL field. Conditional render of embed on event day.

### 18. Save-the-date vs final invite
- **Found:** Single published state.
- **Fix:** Add `inviteStage` enum (save-the-date, invite, thank-you). Different templates per stage.

### 19. Wedding photos / post-wedding gallery
- **Found:** `photos` field exists but unclear if post-event gallery surfaces it.
- **Fix:** Post-wedding gallery section on invite page (guest-uploaded photos w/ moderation). AWS S3 / Cloudinary cheaper than Vercel Blob at scale.

### 20. Custom subdomain
- **Found:** Only path-based slug (`/invite/[slug]`).
- **Fix:** Premium feature — `priya-raj.invitara.com` via wildcard subdomain + middleware rewrite.

---

## P1 — Business / monetization gaps

### 21. Coupon codes
- **Found:** No `coupons` table. No discount logic in `purchases.ts`.
- **Fix:** Coupons table (code, % off, expiry, usage limit, plan restriction). Apply at checkout.

### 22. Referral program
- **Found:** No referral tracking.
- **Fix:** Per-user referral code → credits on signup of referee + on first purchase.

### 23. PDF invoice / GST invoice
- **Found:** Payment row created but no PDF receipt.
- **Why critical:** Indian GST compliance for B2B billing. Users expect invoice email.
- **Fix:** `puppeteer` / `react-pdf` invoice generation. Email + downloadable from /account.

### 24. Refund flow
- **Found:** Payment status has `refunded` but no UI to issue refund from admin.
- **Fix:** Admin refund button → Razorpay refund API → email notification → plan/credit reversal.

### 25. Subscription lifecycle
- **Found:** Plan upgrade in `purchases.ts`. No expiry/renewal handling visible.
- **Risk:** Annual plans never expire? Or expire silently with no warning email.
- **Fix:** `plan_expires_at` column. Cron job 7d/3d/1d before expiry → email + in-app banner. Auto-downgrade on expiry.

### 26. Multi-currency
- **Found:** INR only.
- **Why:** NRI customers paying USD. Razorpay supports multi-currency.
- **Fix:** Currency selector. Price table multi-currency. Stripe for non-INR rails.

---

## P2 — UX / polish

### 27. Email templates incomplete
- **Found:** `lib/email.ts` (5.9KB — likely thin). Has verify-email, reset-password pages.
- **Missing:** RSVP confirmation, wedding day reminder, payment receipt, plan-expiry warning, invite-published.
- **Fix:** React Email templates. Send via Resend.

### 28. i18n
- **Found:** No `next-intl`/`i18next`.
- **Indian market need:** Hindi, Tamil, Telugu, Malayalam, Bengali, Marathi, Gujarati invite templates + UI.
- **Fix:** Phase 1: language-tagged template content (English/Hindi). Phase 2: full UI translation w/ `next-intl`.

### 29. PWA / installable
- **Found:** No manifest, no service worker.
- **Why:** Couples + guests access on mobile. PWA = "Add to homescreen" + offline invite viewing.
- **Fix:** `next-pwa`. Manifest. Cache invite page for offline guest viewing.

### 30. Image optimization on user uploads
- **Found:** `put` to Vercel Blob direct. No resize/webp conversion.
- **Risk:** 5MB photos slow LCP on invite page → bad share UX.
- **Fix:** Image processing pipeline (`sharp` on upload → generate srcset 400/800/1200 webp). Or use Cloudinary/imgix transform URLs.

### 31. Accessibility
- **Found:** No a11y audit. Studio editor likely uses drag-drop without keyboard alt.
- **Fix:** axe-core CI check. Ensure invite page WCAG AA (color contrast on gold theme is risky).

### 32. Print-friendly invite
- **Found:** Digital-only.
- **Fix:** `@media print` styles. Optional PDF download.

### 33. Cookie consent / GDPR / DPDP
- **Found:** No banner. India DPDP Act 2023 + EU GDPR.
- **Fix:** Cookie consent (cookiebot/own). Privacy policy. Terms. Account deletion + data export endpoints.

### 34. Account deletion + data export
- **Found:** No `DELETE /account` endpoint visible.
- **Fix:** User-initiated deletion (soft delete 30d grace). JSON export of all user data.

---

## P2 — Infra / DevOps

### 35. CI/CD
- **Found:** No `.github/workflows/`.
- **Fix:** GitHub Actions: lint, typecheck, test, build, preview deploy.

### 36. Database migrations workflow
- **Found:** 5 migrations in `drizzle/`. Manual.
- **Fix:** Migration runs on deploy via `drizzle-kit migrate` in build step. Rollback strategy doc.

### 37. Backup strategy
- **Found:** PG via Docker compose. No backup automation visible.
- **Fix:** Managed Postgres (Neon/Supabase/RDS) w/ point-in-time recovery. Daily pg_dump to S3 redundant.

### 38. Structured logging
- **Found:** `console.log`/`console.error` only.
- **Fix:** `pino` or built-in `next/logger`. Ship to Datadog/BetterStack.

### 39. Feature flags
- **Found:** None.
- **Fix:** GrowthBook / PostHog flags. Gate experimental templates, AI features.

### 40. Staging environment
- **Found:** Single env presumed.
- **Fix:** Preview deployments per PR (Vercel auto). Dedicated staging DB.

### 41. CSP / security headers
- **Found:** `next.config.*` not reviewed but no obvious headers config.
- **Fix:** `next.config.js` headers: CSP (allow Razorpay/Vercel Blob/Resend), HSTS, X-Frame-Options, Referrer-Policy.

### 42. Secret rotation + .env validation
- **Found:** `app/lib/env.ts` exists (1.5KB) — likely Zod-validated.
- **Verify:** All secrets validated. JWT secret rotation plan.

---

## Quick win priority order (suggested)

```
Week 1:  #2 Upstash rate-limit  •  #3 Webhook idempotency  •  #4 Turnstile  •  #5 Sentry  •  #6 global-error/not-found
Week 2:  #1 Test suite (auth + webhook + e2e checkout)  •  #7 SEO sitemap+OG image  •  #34 Account delete  •  #41 Security headers
Week 3:  #11 Guest list mgmt  •  #12 Multi-event  •  #10 WhatsApp Cloud API  •  #14 QR codes  •  #27 Email templates
Week 4:  #8 Phone OTP  •  #15 Gift/UPI  •  #16 Guestbook  •  #21 Coupons  •  #25 Subscription lifecycle
Week 5+: #29 PWA  •  #28 i18n Hindi  •  #20 Subdomains  •  #30 Image pipeline  •  #19 Post-wedding gallery
```

---

## What already exists & solid

- Drizzle schema covers users/sessions/templates/invitations/payments/plans/ads/audit
- Razorpay webhook HMAC verified w/ `timingSafeEqual`
- Admin dashboard full (users, payments, plans, ads, templates, invitations, audit log)
- Studio editor w/ Canvas, DragDrop, ThreeD, Animation, Export panels
- Auth: bcrypt + JWT sessions, banned user check, email verify, reset password
- Upload route: auth-gated, file-type + size validated
- Ads system DB-driven w/ free-user gating
- Credits + transactions
- Email verify + reset-password pages exist

Foundation strong. Gaps mostly in: testing, monitoring, market-specific features (WhatsApp/OTP/multi-event/gift), and growth tooling (coupons/referrals).
