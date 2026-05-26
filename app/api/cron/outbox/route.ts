/**
 * Outbox dispatcher. Pulls queued messages, attempts send, marks status.
 * Run every minute via vercel.json cron.
 *
 *   Authorization: Bearer <CRON_SECRET>
 */

import { NextResponse } from "next/server";
import { db } from "~/lib/drizzle";
import { messageOutbox } from "~/lib/schema";
import { and, asc, eq, lt, sql } from "drizzle-orm";
import { env } from "~/lib/env";
import { sendWeddingInvite } from "~/lib/whatsapp";
import { log } from "~/lib/logger";

const MAX_PER_RUN = 50;
const MAX_ATTEMPTS = 3;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await db
    .select()
    .from(messageOutbox)
    .where(
      and(
        eq(messageOutbox.status, "queued"),
        lt(messageOutbox.sendAfter, new Date())
      )
    )
    .orderBy(asc(messageOutbox.sendAfter))
    .limit(MAX_PER_RUN);

  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      let ok = false;
      let messageId: string | undefined;
      let error: string | undefined;

      if (job.channel === "whatsapp" && job.templateName === "wedding_invite") {
        const p = job.payload as { guestName?: string; inviteSlug?: string; guestSlug?: string };
        const link = `${env.APP_URL}/g/${p.inviteSlug}/${p.guestSlug}`;
        const r = await sendWeddingInvite({
          to: job.recipient,
          guestName: p.guestName ?? "Guest",
          coupleNames: "the couple",
          personalLink: link,
        });
        ok = r.ok;
        messageId = r.messageId;
        error = r.error;
      } else {
        // Other channels: email/sms — wire up here if needed
        error = `Channel ${job.channel} not implemented in outbox`;
      }

      if (ok) {
        await db
          .update(messageOutbox)
          .set({ status: "sent", sentAt: new Date(), providerMessageId: messageId ?? null })
          .where(eq(messageOutbox.id, job.id));
        sent++;
      } else {
        const attempts = job.attempts + 1;
        await db
          .update(messageOutbox)
          .set({
            status: attempts >= MAX_ATTEMPTS ? "failed" : "queued",
            attempts,
            errorMessage: error ?? null,
            sendAfter: new Date(Date.now() + Math.min(attempts * 60_000, 30 * 60_000)),
          })
          .where(eq(messageOutbox.id, job.id));
        failed++;
      }
    } catch (err) {
      log.error("outbox job error", { jobId: job.id, err: String(err) });
      failed++;
    }
  }

  return NextResponse.json({ processed: jobs.length, sent, failed });
}
