/**
 * WhatsApp Cloud API webhook receiver.
 * Handles verification handshake (GET) + status callbacks (POST).
 */

import { NextResponse } from "next/server";
import { db } from "~/lib/drizzle";
import { messageOutbox, webhookEvents } from "~/lib/schema";
import { eq } from "drizzle-orm";
import { verifyWebhookSubscription, verifyWebhookSignature } from "~/lib/whatsapp";
import { log } from "~/lib/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode") ?? "";
  const token = searchParams.get("hub.verify_token") ?? "";
  const challenge = searchParams.get("hub.challenge") ?? "";
  if (verifyWebhookSubscription(mode, token)) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId = payload?.entry?.[0]?.id ?? `wa:${Date.now()}`;
  try {
    await db.insert(webhookEvents).values({
      provider: "whatsapp",
      eventId,
      eventType: "status",
      payload,
    });
  } catch (err: any) {
    if (err?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
  }

  const statuses: any[] =
    payload?.entry?.flatMap((e: any) => e.changes?.flatMap((c: any) => c.value?.statuses ?? []) ?? []) ?? [];

  for (const s of statuses) {
    try {
      const messageId = s.id as string;
      const status = s.status as string; // sent | delivered | read | failed
      const patch: Record<string, unknown> = {};
      if (status === "delivered") patch.deliveredAt = new Date();
      if (status === "failed") patch.status = "failed";
      patch.providerMessageId = messageId;
      await db
        .update(messageOutbox)
        .set(patch as any)
        .where(eq(messageOutbox.providerMessageId, messageId));
    } catch (err) {
      log.warn("whatsapp status update failed", { err: String(err) });
    }
  }

  return NextResponse.json({ ok: true });
}
