/**
 * Email sending stubs.
 * In development, emails are logged to the console.
 * In production, wire to Resend (https://resend.com) or SendGrid.
 *
 * To activate with Resend:
 *   1. bun add resend
 *   2. Set RESEND_API_KEY and FROM_EMAIL in .env
 *   3. Replace the stub below with actual Resend calls
 */

import { env } from "./env";

const FROM_EMAIL = env.FROM_EMAIL;
const APP_URL = env.APP_URL;

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verifyUrl = `${APP_URL}/auth/verify-email?token=${token}`;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV EMAIL] Verification email to ${to}`);
    console.log(`[DEV EMAIL] Verify URL: ${verifyUrl}`);
    return;
  }

  // TODO: replace with Resend/SendGrid in production
  // Example with Resend:
  // const resend = new Resend(env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: FROM_EMAIL,
  //   to,
  //   subject: "Verify your Invitara account",
  //   html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
  // });
  console.warn("[EMAIL] Production email not configured. Verification email not sent to", to);
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV EMAIL] Password reset email to ${to}`);
    console.log(`[DEV EMAIL] Reset URL: ${resetUrl}`);
    return;
  }

  // TODO: replace with Resend/SendGrid in production
  // const resend = new Resend(env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: FROM_EMAIL,
  //   to,
  //   subject: "Reset your Invitara password",
  //   html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  // });
  console.warn("[EMAIL] Production email not configured. Password reset email not sent to", to);
}
