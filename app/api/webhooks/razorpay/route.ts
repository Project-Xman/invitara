import crypto from "node:crypto";
import { db } from "~/lib/drizzle";
import { users, payments, webhookEvents } from "~/lib/schema";
import { eq } from "drizzle-orm";
import { env } from "~/lib/env";
import { upgradePlan, purchaseTemplate } from "~/lib/purchases";
import { purchaseCredits } from "~/lib/credits";
import { log } from "~/lib/logger";
import { captureException } from "~/lib/sentry";

/**
 * Razorpay webhook handler.
 * - Verifies HMAC signature with timing-safe compare.
 * - DB-level idempotency: webhook_events(provider,event_id) UNIQUE blocks reprocess.
 * - payments.razorpay_payment_id UNIQUE blocks double-grant.
 *
 * Razorpay Dashboard → Webhooks:
 *   URL:    https://yourdomain.com/api/webhooks/razorpay
 *   Events: payment.captured, payment.failed, payment.refunded
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const hmac = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET);
  hmac.update(rawBody);
  const expected = hmac.digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  const valid =
    expectedBuf.length === signatureBuf.length &&
    crypto.timingSafeEqual(expectedBuf, signatureBuf);
  if (!valid) {
    log.warn("razorpay webhook invalid signature");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event as string;
  const eventId = payload.payload?.payment?.entity?.id ?? payload.id ?? `${event}:${Date.now()}`;
  const payment = payload.payload?.payment?.entity;

  // DB-level idempotency: reject duplicate event ids
  try {
    await db.insert(webhookEvents).values({
      provider: "razorpay",
      eventId,
      eventType: event,
      payload,
    });
  } catch (err: any) {
    if (err?.code === "23505" || /duplicate/i.test(err?.message ?? "")) {
      log.info("razorpay webhook duplicate skipped", { eventId, event });
      return Response.json({ ok: true, duplicate: true });
    }
    log.error("webhook idempotency insert failed", { err: String(err) });
    return Response.json({ ok: true });
  }

  try {
    if (event === "payment.captured" && payment) {
      await handlePaymentCaptured(payment);
    } else if (event === "payment.failed" && payment) {
      await handlePaymentFailed(payment);
    } else if (event === "payment.refunded" && payment) {
      await handlePaymentRefunded(payment);
    }
  } catch (err) {
    await captureException(err, { event, eventId });
    log.error("razorpay webhook handler error", { err: String(err), event, eventId });
  }

  return Response.json({ ok: true });
}

async function handlePaymentFailed(payment: any) {
  const paymentId: string = payment.id;
  const notes: Record<string, string> = payment.notes ?? {};
  const { type, userId } = notes;

  const VALID_TYPES = ["subscription", "credits", "template"] as const;
  type ValidType = (typeof VALID_TYPES)[number];

  if (!type || !userId || !VALID_TYPES.includes(type as ValidType)) {
    log.warn("payment.failed missing/invalid notes", { paymentId, type, userId });
    return;
  }

  try {
    await db.insert(payments).values({
      userId,
      type: type as ValidType,
      amount: String((payment.amount ?? 0) / 100),
      currency: payment.currency ?? "INR",
      status: "failed",
      razorpayPaymentId: paymentId,
      razorpayOrderId: payment.order_id ?? null,
      metadata: {
        error_code: payment.error_code ?? null,
        error_description: payment.error_description ?? null,
        notes,
      },
    });
    log.info("payment.failed recorded", { userId, paymentId });
  } catch (err: any) {
    if (err?.code === "23505") {
      log.info("payment.failed idempotent skip", { paymentId });
      return;
    }
    log.error("handlePaymentFailed error", { err: String(err), paymentId });
  }
}

async function handlePaymentCaptured(payment: any) {
  const paymentId: string = payment.id;
  const notes: Record<string, string> = payment.notes ?? {};
  const { type, userId, plan, packageId, templateId } = notes;

  const VALID_TYPES = ["subscription", "credits", "template"] as const;
  if (!type || !userId || !VALID_TYPES.includes(type as any)) {
    log.warn("payment.captured missing/invalid notes", { paymentId, type, userId });
    return;
  }

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
  if (!user) {
    log.warn("payment.captured user not found", { userId });
    return;
  }

  try {
    if (type === "subscription" && plan) {
      await upgradePlan(user.id, plan as "starter" | "premium" | "royal", paymentId, "completed");
      log.info("plan upgraded", { userId, plan, paymentId });
    } else if (type === "credits" && packageId) {
      await purchaseCredits(user.id, Number(packageId), paymentId, "completed");
      log.info("credits purchased", { userId, packageId, paymentId });
    } else if (type === "template" && templateId) {
      await purchaseTemplate(user.id, templateId, paymentId, "completed");
      log.info("template purchased", { userId, templateId, paymentId });
    } else {
      log.warn("payment.captured unrecognised", { type, notes });
    }
  } catch (err: any) {
    if (
      err?.code === "23505" ||
      err?.message?.includes("already owned") ||
      err?.message?.includes("duplicate")
    ) {
      log.info("payment.captured idempotent skip", { paymentId });
      return;
    }
    throw err;
  }
}

async function handlePaymentRefunded(payment: any) {
  const paymentId: string = payment.id;
  try {
    const result = await db
      .update(payments)
      .set({
        status: "refunded",
        refundedAt: new Date(),
        refundReason: payment.refund_reason ?? null,
      })
      .where(eq(payments.razorpayPaymentId, paymentId))
      .returning({ id: payments.id, userId: payments.userId, type: payments.type });
    log.info("payment.refunded recorded", { paymentId, matched: result.length });
  } catch (err) {
    log.error("handlePaymentRefunded error", { err: String(err), paymentId });
  }
}
