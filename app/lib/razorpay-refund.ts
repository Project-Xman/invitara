/**
 * Razorpay refund. Server-only.
 *
 * https://razorpay.com/docs/api/refunds/
 */

import { env } from "./env";
import { log } from "./logger";

export async function razorpayRefund(input: {
  paymentId: string;
  amount?: number; // in paise; omit for full refund
  notes?: Record<string, string>;
  speed?: "normal" | "optimum";
}): Promise<{ ok: boolean; refundId?: string; error?: string }> {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return { ok: false, error: "Razorpay not configured" };
  }
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  try {
    const res = await fetch(`https://api.razorpay.com/v1/payments/${input.paymentId}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amount,
        speed: input.speed ?? "normal",
        notes: input.notes,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      log.warn("razorpay refund failed", { status: res.status, error: data.error });
      return { ok: false, error: data.error?.description ?? `HTTP ${res.status}` };
    }
    return { ok: true, refundId: data.id };
  } catch (err) {
    log.error("razorpay refund error", { err: String(err) });
    return { ok: false, error: String(err) };
  }
}
