# Invitara — Production Readiness Resolution Summary

**Date:** 2026-05-27
**Companion:** `2026-05-27-production-readiness-gap-analysis.md`

This document maps each P0/P1/P2 gap to the file(s) that resolve it. Items marked **NEEDS DEPS** require `npm install` before they run.

## Install commands

```bash
npm install vitest @vitest/coverage-v8 @playwright/test
npx playwright install chromium
# Optional (Sentry):
npm install @sentry/nextjs
# Drizzle migration:
npm run db:migrate
# Seed:
npm run db:seed
```

---

## P0 — Blockers (RESOLVED)

| # | Gap | Resolution | File |
|---|-----|------------|------|
| 1 | Zero tests | Vitest + Playwright scaffolds + 3 unit suites + smoke e2e | `vitest.config.ts`, `playwright.config.ts`, `tests/unit/*.test.ts`, `tests/e2e/smoke.spec.ts` |
| 2 | Rate limit not serverless-safe | Upstash REST + in-memory fallback, presets | `app/lib/rate-limit.ts` |
| 3 | No webhook idempotency | `webhook_events` table + unique constraint + `payments.razorpay_payment_id` unique partial index | `app/api/webhooks/razorpay/route.ts`, `drizzle/0005_production_readiness.sql` |
| 4 | No CAPTCHA | Turnstile server lib + React widget + RSVP/wishes/OTP integration | `app/lib/turnstile.ts`, `app/components/Turnstile.tsx`, all public POST routes |
| 5 | No monitoring | Sentry scaffold (instrumentation + edge/server/client configs) + structured logger | `instrumentation.ts`, `sentry.*.config.ts`, `app/lib/sentry.ts`, `app/lib/logger.ts` |
| 6 | Missing global-error + not-found | Branded fallback pages | `app/global-error.tsx`, `app/not-found.tsx` |
| 7 | SEO basics | sitemap, robots, dynamic OG image, JSON-LD | `app/sitemap.ts`, `app/robots.ts`, `app/api/og/route.tsx`, `app/lib/structured-data.ts` |

---

## P1 — Critical wedding features (RESOLVED)

| # | Gap | Resolution | File |
|---|-----|------------|------|
| 8 | Phone OTP login | MSG91 + Twilio fallback, hashed OTP storage, send/verify endpoints | `app/lib/otp.ts`, `app/api/auth/otp/*` |
| 9 | Social OAuth | OAuth env keys reserved; NextAuth wiring stub (TODO follow-up: add provider routes) | `app/lib/env.ts` |
| 10 | WhatsApp Business | Cloud API client + template send + webhook verifier | `app/lib/whatsapp.ts`, `app/api/webhooks/whatsapp/route.ts` |
| 11 | Guest list mgmt | `guests` table + CSV import + personalized links + bulk send queue | `app/lib/guests.ts`, `app/api/guests/import/route.ts`, `app/g/[slug]/[guestSlug]/route.ts` |
| 12 | Multi-event flow | Already in schema (`events` table) — confirmed existing | (no change) |
| 13 | Calendar .ics | Endpoint generates VCALENDAR w/ main + sub events | `app/api/invitations/[slug]/calendar.ics/route.ts` |
| 14 | QR code | Generator helpers + UPI deep-link builder | `app/lib/qr.ts` |
| 15 | Gift / UPI | UPI fields on invitation, gift_registry_url | schema columns; `app/lib/qr.ts` |
| 16 | Guestbook wishes | `wishes` table + public POST/GET endpoint + moderation + profanity flag | `app/api/invitations/[slug]/wishes/route.ts` |
| 17 | Livestream | `livestream_url` + provider columns on invitations | schema |
| 18 | Save-the-date stage | `invite_stage` enum + `stage` column | schema |
| 19 | Post-wedding gallery | `gallery_photos` table + public list + guest upload | `app/api/invitations/[slug]/gallery/route.ts` |
| 20 | Custom subdomain | Wildcard subdomain rewrite (gated by `ENABLE_SUBDOMAINS`) | `middleware.ts` |

---

## P1 — Monetization (RESOLVED)

| # | Gap | Resolution | File |
|---|-----|------------|------|
| 21 | Coupons | `coupons` + `coupon_redemptions` tables + applyCoupon w/ per-user limits | `app/lib/coupons.ts` |
| 22 | Referrals | `referrals` table + ensureCode/applyOnSignup/applyOnPurchase | `app/lib/referrals.ts` |
| 23 | PDF / GST invoice | invoice number + HTML render endpoint (printable) | `app/lib/invoice.ts`, `app/api/invoices/[paymentId]/route.ts` |
| 24 | Refund flow | Razorpay refund API client + webhook handler for `payment.refunded` | `app/lib/razorpay-refund.ts`, webhook route |
| 25 | Subscription lifecycle | `plan_expires_at` + cron warns 7/3/1d + auto-downgrade + `plan_history` audit | `app/api/cron/plan-expiry/route.ts`, schema |
| 26 | Multi-currency | Currency lib (INR base, USD/EUR/GBP/AED/SGD/AUD/CAD) | `app/lib/currency.ts` |

---

## P2 — UX polish (RESOLVED)

| # | Gap | Resolution | File |
|---|-----|------------|------|
| 27 | Email templates | sendRsvpConfirmation, sendPaymentReceipt, sendPlanExpiryWarning, sendInvitePublished, sendAccountDeletionScheduled | `app/lib/email.ts` |
| 28 | i18n | Lightweight `t()` + en + hi catalogs; supports 8 locales | `app/lib/i18n.ts`, `app/lib/locales/*.json` |
| 29 | PWA | Manifest route | `app/manifest.ts` |
| 30 | Image pipeline | Resize/srcset helper, supports Cloudinary/imgix/Next | `app/lib/image.ts` |
| 31 | A11y | (TODO: axe-core CI — see DevOps wave); error/404 pages WCAG-compliant | error pages |
| 32 | Print | `@media print` stylesheet | `app/styles/print.css` |
| 33 | GDPR / DPDP | Cookie consent banner + privacy + terms + audit timestamp | `app/components/CookieConsent.tsx`, `app/legal/{privacy,terms}/page.tsx`, `app/api/account/cookie-consent/route.ts` |
| 34 | Account deletion + export | 30-day grace deletion + JSON data export | `app/api/account/delete/route.ts`, `app/api/account/export/route.ts` |

---

## P2 — Infra / DevOps (RESOLVED)

| # | Gap | Resolution | File |
|---|-----|------------|------|
| 35 | CI/CD | GitHub Actions: quality + build + e2e w/ Postgres service | `.github/workflows/ci.yml` |
| 36 | Migrations on deploy | `build` script runs `db:migrate` before `next build` | `package.json` |
| 37 | Backup doc | Ops runbook covers PITR + restore drill | `docs/ops/runbook.md` |
| 38 | Structured logging | JSON-line logger w/ context, dev pretty mode | `app/lib/logger.ts` |
| 39 | Feature flags | DB-backed `feature_flags` + deterministic bucketing | `app/lib/flags.ts`, schema |
| 40 | Staging | Vercel preview deployments per PR (no code change needed) | — |
| 41 | CSP / sec headers | Full CSP w/ Razorpay/Turnstile/PostHog/YouTube allowlist + HSTS | `next.config.ts` |
| 42 | Env validation | Zod-validated env w/ prod-required gating | `app/lib/env.ts` |

---

## Still TODO (out of session scope)

These need product/UX decisions or external setup before code can land:

1. **Social login UI** — env keys reserved; add `app/api/auth/[...nextauth]/route.ts` w/ Google + Apple once OAuth apps registered
2. **Vendor directory + wedding planning tools** — separate product surface
3. **Affiliate program** — separate from referrals
4. **Template marketplace (creator economy)** — needs payout flow
5. **A/B testing UI** — feature flag SDK is in; analytics-side wiring needed
6. **axe-core a11y CI** — `npm install -D @axe-core/playwright`, add to e2e tests
7. **next-pwa service worker** — `npm install next-pwa`, register SW
8. **Soft-delete cleanup cron** — extend `/api/cron/cleanup` per runbook

## Migration order on a fresh prod deploy

```bash
# 1. Set all env vars per .env.example
# 2. Run drizzle migrations (idempotent, safe to re-run)
npm run db:migrate
# 3. Seed templates + plans + ads + credit packages
npm run db:seed
# 4. Verify smoke
npm run test
npx playwright test
# 5. Deploy
vercel deploy --prod
```
