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

async function send(to: string, subject: string, body: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV EMAIL] ${subject} → ${to}`);
    return;
  }
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[EMAIL] not configured. Skipping: ${subject} → ${to}`);
    return;
  }
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html: emailBase(body) });
}

export async function sendRsvpConfirmation(to: string, opts: {
  guestName: string;
  coupleNames: string;
  status: string;
  inviteUrl: string;
}): Promise<void> {
  const body = `
    <h1 style="margin:0 0 8px;font-size:26px;color:#1a1209;">Thank you, ${opts.guestName} 💌</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#6b5a3a;line-height:1.6;">
      Your RSVP for <strong>${opts.coupleNames}</strong>'s wedding has been recorded as <strong>${opts.status}</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#9e8a5a;">
      You can revisit the invite any time and update your response if plans change.
    </p>
    <a href="${opts.inviteUrl}" style="display:inline-block;background:#D4A853;color:#fff;padding:12px 28px;border-radius:30px;text-decoration:none;font-weight:600;">View invitation</a>
  `;
  await send(to, `RSVP confirmed — ${opts.coupleNames}'s wedding`, body);
}

export async function sendPaymentReceipt(to: string, opts: {
  userName: string;
  amount: string;
  currency: string;
  type: string;
  invoiceUrl: string;
}): Promise<void> {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#1a1209;">Payment received ✅</h1>
    <p style="margin:0 0 16px;color:#6b5a3a;line-height:1.6;">Hi ${opts.userName}, we've received your payment.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:8px 0;color:#9e8a5a;font-size:13px;">Type</td><td style="text-align:right;font-weight:600;">${opts.type}</td></tr>
      <tr><td style="padding:8px 0;color:#9e8a5a;font-size:13px;">Amount</td><td style="text-align:right;font-weight:600;">${opts.currency} ${opts.amount}</td></tr>
    </table>
    <a href="${opts.invoiceUrl}" style="display:inline-block;background:#D4A853;color:#fff;padding:12px 28px;border-radius:30px;text-decoration:none;font-weight:600;">Download invoice</a>
  `;
  await send(to, "Payment receipt — Invitara", body);
}

export async function sendPlanExpiryWarning(to: string, opts: {
  userName: string;
  plan: string;
  daysLeft: number;
  renewUrl: string;
}): Promise<void> {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#1a1209;">Your ${opts.plan} plan expires in ${opts.daysLeft} day${opts.daysLeft === 1 ? "" : "s"}</h1>
    <p style="margin:0 0 24px;color:#6b5a3a;line-height:1.6;">
      Hi ${opts.userName}, your subscription renews soon. To keep premium templates, no ads, and unlimited publishing, renew below.
    </p>
    <a href="${opts.renewUrl}" style="display:inline-block;background:#D4A853;color:#fff;padding:12px 28px;border-radius:30px;text-decoration:none;font-weight:600;">Renew now</a>
  `;
  await send(to, `Your Invitara plan expires in ${opts.daysLeft} day${opts.daysLeft === 1 ? "" : "s"}`, body);
}

export async function sendInvitePublished(to: string, opts: {
  userName: string;
  coupleNames: string;
  inviteUrl: string;
}): Promise<void> {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;color:#1a1209;">Your invitation is live! 🎉</h1>
    <p style="margin:0 0 24px;color:#6b5a3a;line-height:1.6;">
      Hi ${opts.userName}, your wedding invitation for ${opts.coupleNames} is ready to share.
    </p>
    <a href="${opts.inviteUrl}" style="display:inline-block;background:#D4A853;color:#fff;padding:12px 28px;border-radius:30px;text-decoration:none;font-weight:600;">View invite</a>
    <p style="margin:24px 0 0;font-size:13px;color:#9e8a5a;">Or share directly: <span style="color:#5c4a1a;">${opts.inviteUrl}</span></p>
  `;
  await send(to, "Your wedding invitation is live", body);
}

export async function sendAccountDeletionScheduled(to: string, opts: {
  userName: string;
  scheduledFor: Date;
  cancelUrl: string;
}): Promise<void> {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1a1209;">Account deletion scheduled</h1>
    <p style="margin:0 0 16px;color:#6b5a3a;line-height:1.6;">
      Hi ${opts.userName}, your Invitara account is scheduled for deletion on
      <strong>${opts.scheduledFor.toDateString()}</strong>.
    </p>
    <p style="margin:0 0 24px;color:#6b5a3a;">If you change your mind before then, you can cancel anytime.</p>
    <a href="${opts.cancelUrl}" style="display:inline-block;background:#D4A853;color:#fff;padding:12px 28px;border-radius:30px;text-decoration:none;font-weight:600;">Cancel deletion</a>
  `;
  await send(to, "Account deletion scheduled — Invitara", body);
}
