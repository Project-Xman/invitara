/**
 * Cloudflare Turnstile CAPTCHA verification.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * Returns true if token verifies. In dev or when key missing, returns true
 * (so flows still work locally — gate enforcement on env.isProd).
 */

import { env } from "./env";
import { log } from "./logger";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string | null | undefined, ip?: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) {
    if (env.isProd) {
      log.warn("Turnstile secret not configured in production — CAPTCHA bypassed");
    }
    return true;
  }

  if (!token) return false;

  const params = new URLSearchParams();
  params.set("secret", env.TURNSTILE_SECRET_KEY);
  params.set("response", token);
  if (ip) params.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body: params,
    });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      log.warn("Turnstile verify failed", { errors: data["error-codes"] });
    }
    return data.success === true;
  } catch (err) {
    log.error("Turnstile verify error", { err: String(err) });
    return false;
  }
}

export function assertHumanOrThrow(verified: boolean): void {
  if (!verified) {
    const err = new Error("CAPTCHA verification failed. Please try again.");
    (err as any).status = 400;
    throw err;
  }
}
