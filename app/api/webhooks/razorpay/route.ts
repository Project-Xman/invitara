import crypto from "node:crypto";
import { db } from "~/lib/drizzle";
import { users } from "~/lib/schema";
import { eq } from "drizzle-orm";
import { env } from "~/lib/env";
import { upgradePlan, purchaseTemplate } from "~/lib/purchases";
import { purchaseCredits } from "~/lib/credits";

/**
 * Razorpay webhook handler.
 * Verifies HMAC signature, then handles payment.captured as the authoritative
 * source of truth for granting access (credits / plan / template).
 *
 * Setup in Razorpay Dashboard → Webhooks:
 *   URL: https://yourdomain.com/api/webhooks/razorpay
 *   Events: payment.captured, payment.failed
 *   Secret: <RAZORPAY_WEBHOOK_SECRET>
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

  if (expected !== signature) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event as string;
  const payment = payload.payload?.payment?.entity;

  if (event === "payment.captured" && payment) {
    await handlePaymentCaptured(payment);
  } else if (event === "payment.failed" && payment) {
    console.log("[Webhook] payment.failed:", payment.id);
  }

  return Response.json({ ok: true });
}

async function handlePaymentCaptured(payment: any) {
  const paymentId: string = payment.id;
  const notes: Record<string, string> = payment.notes ?? {};
  const { type, userId, plan, packageId, templateId } = notes;

  if (!type || !userId) {
    console.warn("[Webhook] payment.captured missing type/userId in notes:", paymentId);
    return;
  }

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
  if (!user) {
    console.warn("[Webhook] payment.captured: user not found", userId);
    return;
  }

  try {
    if (type === "subscription" && plan) {
      await upgradePlan(user.id, plan as "starter" | "premium" | "royal", paymentId, "completed");
      console.log(`[Webhook] Plan upgraded: user=${userId} plan=${plan}`);
    } else if (type === "credits" && packageId) {
      await purchaseCredits(user.id, Number(packageId), paymentId, "completed");
      console.log(`[Webhook] Credits purchased: user=${userId} pkg=${packageId}`);
    } else if (type === "template" && templateId) {
      await purchaseTemplate(user.id, templateId, paymentId, "completed");
      console.log(`[Webhook] Template purchased: user=${userId} tmpl=${templateId}`);
    } else {
      console.warn("[Webhook] payment.captured: unrecognised type/payload", type, notes);
    }
  } catch (err: any) {
    if (err?.message?.includes("already owned") || err?.message?.includes("duplicate")) {
      console.log("[Webhook] Idempotent skip:", err.message);
    } else {
      console.error("[Webhook] handlePaymentCaptured error:", err);
    }
  }
}
