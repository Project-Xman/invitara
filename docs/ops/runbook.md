# Invitara — Operations Runbook

## Production checklist before launch

- [ ] All `.env` keys filled (see `.env.example`)
- [ ] Postgres: managed instance with PITR (Neon / Supabase / RDS) — NOT docker-compose
- [ ] Razorpay account live, webhook URL configured, signing secret rotated quarterly
- [ ] Resend domain verified, SPF/DKIM set
- [ ] Cloudflare Turnstile sitekey + secret set
- [ ] Upstash Redis instance created (rate-limit + soon caching)
- [ ] Sentry project + DSN set
- [ ] Vercel cron entries match `vercel.json`
- [ ] DNS: A/AAAA for root + wildcard if `ENABLE_SUBDOMAINS=true`
- [ ] DB migrations applied: `npm run db:migrate`
- [ ] Seed data: `npm run db:seed`

## Database backups

**Managed Postgres (Neon/Supabase):** PITR enabled, default 7-day retention. Verify weekly.

**Self-hosted PG (not recommended for prod):**

```bash
pg_dump "$DATABASE_URL" --format=custom > backups/invitara-$(date +%F).dump
# Upload to S3/B2 with daily lifecycle
```

Restore drill: monthly. Restore a copy to a staging DB and run smoke tests.

## Cron jobs (managed via Vercel)

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/cleanup` | `0 3 * * *` | Purge expired sessions, old analytics |
| `/api/cron/plan-expiry` | `0 4 * * *` | Warn + auto-downgrade expired plans |
| `/api/cron/outbox` | `* * * * *` | Dispatch queued WhatsApp/email/SMS |

All cron routes require `Authorization: Bearer $CRON_SECRET`.

## Razorpay webhooks

- URL: `https://yourdomain.com/api/webhooks/razorpay`
- Events: `payment.captured`, `payment.failed`, `payment.refunded`
- Secret: matches `RAZORPAY_WEBHOOK_SECRET`
- Idempotency: enforced via `webhook_events(provider,event_id)` + `payments.razorpay_payment_id` unique

## Incident response

1. Check Sentry for new issues
2. Check `/api/cron/*` recent invocations
3. Check Razorpay dashboard for webhook failures
4. Rate-limit override: empty Upstash key to fall back to in-memory (degraded but functional)

## Secret rotation

- `JWT_SECRET`: rotate yearly. Sessions invalidate on rotation (acceptable).
- `RAZORPAY_WEBHOOK_SECRET`: rotate quarterly. Sync with dashboard.
- `CRON_SECRET`: rotate quarterly.
- API keys (Resend, Upstash, Sentry): rotate on staff change.

## Restore from data export

User-initiated export at `/api/account/export` returns JSON. To re-ingest into a fresh account:
1. Create new account
2. POST `/api/admin/restore` (TODO — implement when needed) with the JSON

## Soft-delete cleanup

Run monthly:
```sql
DELETE FROM users WHERE deletion_scheduled_at IS NOT NULL AND deletion_scheduled_at < NOW();
```
(Should be wired into `/api/cron/cleanup` — TODO.)
