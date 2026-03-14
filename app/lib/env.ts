/**
 * Validated environment variables.
 * Required vars throw at startup if missing in production.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET: process.env.JWT_SECRET ?? "invitara-dev-secret-NOT-FOR-PRODUCTION",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
  PORT: process.env.PORT ?? "3000",

  // Payment (optional — warn if missing in production)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ?? "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",

  // File storage (Vercel Blob — required for photo/music uploads)
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ?? "",

  // Email (optional — required for password reset / verification in production)
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  FROM_EMAIL: process.env.FROM_EMAIL ?? "noreply@invitara.com",

  // Cron (optional)
  CRON_SECRET: process.env.CRON_SECRET ?? "",

  // Admin
  SUPERADMIN_EMAILS: process.env.SUPERADMIN_EMAILS ?? "",

  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
} as const;
