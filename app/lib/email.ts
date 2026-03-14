/**
 * Email sending via Resend (https://resend.com).
 * In development, emails are logged to the console instead.
 *
 * Setup:
 *   1. Set RESEND_API_KEY in .env
 *   2. Set FROM_EMAIL in .env (must be a verified sender domain in Resend)
 *   3. Set APP_URL in .env to your production domain
 */

import { Resend } from "resend";
import { env } from "./env";

const FROM_EMAIL = env.FROM_EMAIL || "noreply@invitara.com";
const APP_URL = env.APP_URL;

function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  return new Resend(env.RESEND_API_KEY);
}

const emailBase = (body: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
  <body style="margin:0;padding:0;background:#faf8f3;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:40px 0;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e8d9b0;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#A67C2E 0%,#D4A853 100%);padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#fff8e7;font-size:13px;letter-spacing:4px;font-weight:600;text-transform:uppercase;">Invitara</p>
              <p style="margin:4px 0 0;color:rgba(255,248,231,0.7);font-size:11px;letter-spacing:2px;">Golden Wedding Invitations</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f0e8d0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#b8a878;">© ${new Date().getFullYear()} Invitara. Crafted with love for your special day.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
`;

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verifyUrl = `${APP_URL}/auth/verify-email?token=${token}`;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV EMAIL] Verification email to ${to}`);
    console.log(`[DEV EMAIL] Verify URL: ${verifyUrl}`);
    return;
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn("[EMAIL] RESEND_API_KEY not configured. Verification email not sent to", to);
    return;
  }

  const html = emailBase(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1209;">Welcome to Invitara 💌</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b5a3a;line-height:1.6;">
      Thank you for joining Invitara! Please verify your email address to activate your account and start creating beautiful wedding invitations.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:8px 0 28px;">
        <a href="${verifyUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#A67C2E,#D4A853);color:#fff;
                  padding:16px 36px;border-radius:50px;text-decoration:none;
                  font-weight:700;font-size:15px;letter-spacing:0.5px;
                  box-shadow:0 4px 12px rgba(166,124,46,0.35);">
          Verify Email Address
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#9e8a5a;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:12px;color:#b8a878;word-break:break-all;">${verifyUrl}</p>
    <p style="margin:0;font-size:12px;color:#b8a878;">
      This link expires in 24 hours. If you did not create an Invitara account, you can safely ignore this email.
    </p>
  `);

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verify your Invitara account",
    html,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV EMAIL] Password reset email to ${to}`);
    console.log(`[DEV EMAIL] Reset URL: ${resetUrl}`);
    return;
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn("[EMAIL] RESEND_API_KEY not configured. Password reset email not sent to", to);
    return;
  }

  const html = emailBase(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#1a1209;">Password Reset Request 🔐</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6b5a3a;line-height:1.6;">
      We received a request to reset your Invitara password. Click the button below to choose a new password.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:8px 0 28px;">
        <a href="${resetUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#A67C2E,#D4A853);color:#fff;
                  padding:16px 36px;border-radius:50px;text-decoration:none;
                  font-weight:700;font-size:15px;letter-spacing:0.5px;
                  box-shadow:0 4px 12px rgba(166,124,46,0.35);">
          Reset My Password
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#9e8a5a;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:12px;color:#b8a878;word-break:break-all;">${resetUrl}</p>
    <p style="margin:0;font-size:12px;color:#b8a878;">
      This link expires in 1 hour. If you did not request a password reset, please ignore this email — your account is safe.
    </p>
  `);

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your Invitara password",
    html,
  });
}
