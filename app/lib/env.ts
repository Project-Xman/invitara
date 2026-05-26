/**
 * Validated environment variables via Zod.
 * In production, missing required vars throw at startup.
 * In dev, defaults keep things running.
 */

import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const requiredInProd = (msg: string) =>
  z.string().refine((v) => !isProd || v.length > 0, { message: msg });

const schema = z.object({
  // Core
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_ROOT_DOMAIN: z.string().default("localhost"),
  PORT: z.string().default("3000"),

  // Database
  DATABASE_URL: requiredInProd("DATABASE_URL required in production"),

  // Auth
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be >= 32 chars")
    .or(z.literal("invitara-dev-secret-NOT-FOR-PRODUCTION"))
    .default("invitara-dev-secret-NOT-FOR-PRODUCTION"),

  // Payments — Razorpay
  RAZORPAY_KEY_ID: z.string().default(""),
  RAZORPAY_KEY_SECRET: z.string().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().default(""),

  // Payments — Stripe (multi-currency, NRI)
  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),

  // Storage
  BLOB_READ_WRITE_TOKEN: z.string().default(""),

  // Email
  RESEND_API_KEY: z.string().default(""),
  FROM_EMAIL: z.string().default("noreply@invitara.com"),
  REPLY_TO_EMAIL: z.string().default("support@invitara.com"),

  // Cron
  CRON_SECRET: z.string().default(""),

  // Admin
  SUPERADMIN_EMAILS: z.string().default(""),

  // Rate limit (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().default(""),

  // Observability — Sentry
  SENTRY_DSN: z.string().default(""),
  NEXT_PUBLIC_SENTRY_DSN: z.string().default(""),
  SENTRY_ENV: z.string().default("development"),

  // Observability — PostHog
  NEXT_PUBLIC_POSTHOG_KEY: z.string().default(""),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().default("https://app.posthog.com"),

  // CAPTCHA — Cloudflare Turnstile
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().default(""),
  TURNSTILE_SECRET_KEY: z.string().default(""),

  // WhatsApp Business Cloud API (Meta)
  WHATSAPP_PHONE_NUMBER_ID: z.string().default(""),
  WHATSAPP_ACCESS_TOKEN: z.string().default(""),
  WHATSAPP_VERIFY_TOKEN: z.string().default(""),
  WHATSAPP_APP_SECRET: z.string().default(""),

  // OTP — MSG91 (or Twilio fallback)
  MSG91_AUTH_KEY: z.string().default(""),
  MSG91_SENDER_ID: z.string().default("INVITR"),
  MSG91_OTP_TEMPLATE_ID: z.string().default(""),
  TWILIO_ACCOUNT_SID: z.string().default(""),
  TWILIO_AUTH_TOKEN: z.string().default(""),
  TWILIO_FROM_NUMBER: z.string().default(""),

  // Social OAuth (NextAuth)
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  FACEBOOK_CLIENT_ID: z.string().default(""),
  FACEBOOK_CLIENT_SECRET: z.string().default(""),

  // Subdomains
  ENABLE_SUBDOMAINS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),

  // Feature flags backend
  GROWTHBOOK_API_HOST: z.string().default(""),
  GROWTHBOOK_CLIENT_KEY: z.string().default(""),

  // Image pipeline
  IMAGE_CDN_URL: z.string().default(""),
});

type Env = z.infer<typeof schema>;

function parseEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    if (isProd) {
      console.error("[env] Invalid environment variables:", parsed.error.flatten().fieldErrors);
      throw new Error("Invalid environment variables");
    }
    console.warn("[env] Environment validation issues (dev — continuing):", parsed.error.flatten().fieldErrors);
    return schema.parse({
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? "development",
    });
  }
  return parsed.data;
}

export const env = {
  ...parseEnv(),
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;
