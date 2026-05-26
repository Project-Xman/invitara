/**
 * Vitest setup. Stubs env vars + suppresses noisy logs.
 */

Object.defineProperty(process.env, "NODE_ENV", { value: "test", configurable: true });
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/invitara_test";
process.env.JWT_SECRET ??= "test-jwt-secret-32-chars-minimum-length-please";
process.env.APP_URL ??= "http://localhost:3000";
process.env.RAZORPAY_WEBHOOK_SECRET ??= "test-webhook-secret";
process.env.RAZORPAY_KEY_SECRET ??= "test-key-secret";
