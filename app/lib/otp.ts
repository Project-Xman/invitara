/**
 * Phone OTP service. Uses MSG91 by default (India) with Twilio fallback.
 * OTP is hashed at rest; verifies via constant-time compare.
 *
 * Flow:
 *   sendOtp(phone, purpose) → generates 6-digit, stores hash, dispatches via SMS
 *   verifyOtp(phone, code, purpose) → returns true on match + marks consumed
 *
 * Rate-limit at caller via assertRateLimit("otp-send", phone).
 */

import { db } from "./drizzle";
import { otpCodes } from "./schema";
import { and, desc, eq, gt } from "drizzle-orm";
import { randomInt, createHash, timingSafeEqual } from "node:crypto";
import { env } from "./env";
import { log } from "./logger";

export type OtpPurpose = "login" | "phone_verify" | "rsvp";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function sendOtp(
  identifier: string,
  purpose: OtpPurpose,
  ip?: string
): Promise<{ ok: boolean; error?: string }> {
  const code = generateCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.insert(otpCodes).values({
    identifier,
    codeHash,
    purpose,
    expiresAt,
    ipAddress: ip ?? null,
  });

  const dispatched = await dispatch(identifier, code, purpose);
  return dispatched;
}

async function dispatch(to: string, code: string, purpose: OtpPurpose): Promise<{ ok: boolean; error?: string }> {
  // Dev: log to console
  if (!env.isProd && !env.MSG91_AUTH_KEY && !env.TWILIO_ACCOUNT_SID) {
    log.info(`[DEV OTP] ${purpose} for ${to}: ${code}`);
    return { ok: true };
  }

  // MSG91 (India)
  if (env.MSG91_AUTH_KEY) {
    try {
      const params = new URLSearchParams({
        template_id: env.MSG91_OTP_TEMPLATE_ID,
        mobile: to.replace(/^\+/, ""),
        otp: code,
        authkey: env.MSG91_AUTH_KEY,
      });
      const res = await fetch(`https://control.msg91.com/api/v5/otp?${params}`, { method: "POST" });
      if (!res.ok) {
        const err = await res.text();
        log.warn("msg91 send failed", { status: res.status, err });
        return { ok: false, error: `MSG91: ${res.status}` };
      }
      return { ok: true };
    } catch (err) {
      log.error("msg91 error", { err: String(err) });
      return { ok: false, error: String(err) };
    }
  }

  // Twilio fallback
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
      const params = new URLSearchParams({
        From: env.TWILIO_FROM_NUMBER,
        To: to,
        Body: `Your Invitara code is ${code}. Valid 5 min.`,
      });
      const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });
      if (!res.ok) {
        log.warn("twilio send failed", { status: res.status });
        return { ok: false, error: `Twilio: ${res.status}` };
      }
      return { ok: true };
    } catch (err) {
      log.error("twilio error", { err: String(err) });
      return { ok: false, error: String(err) };
    }
  }

  log.warn("No OTP provider configured");
  return { ok: false, error: "No OTP provider configured" };
}

export async function verifyOtp(
  identifier: string,
  code: string,
  purpose: OtpPurpose
): Promise<boolean> {
  const [latest] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.identifier, identifier),
        eq(otpCodes.purpose, purpose),
        eq(otpCodes.consumed, false),
        gt(otpCodes.expiresAt, new Date())
      )
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!latest) return false;
  if (latest.attempts >= MAX_ATTEMPTS) return false;

  const inputHash = hashCode(code);
  const a = Buffer.from(inputHash, "hex");
  const b = Buffer.from(latest.codeHash, "hex");
  const matched = a.length === b.length && timingSafeEqual(a, b);

  if (!matched) {
    await db
      .update(otpCodes)
      .set({ attempts: latest.attempts + 1 })
      .where(eq(otpCodes.id, latest.id));
    return false;
  }

  await db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, latest.id));
  return true;
}
