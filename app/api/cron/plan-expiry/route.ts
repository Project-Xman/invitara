/**
 * Daily cron: warn users whose plan expires in 7/3/1 days; auto-downgrade expired.
 *   Schedule via vercel.json: 0 4 * * *
 */

import { NextResponse } from "next/server";
import { db } from "~/lib/drizzle";
import { users, planHistory } from "~/lib/schema";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { env } from "~/lib/env";
import { log } from "~/lib/logger";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400_000);
  const in3 = new Date(now.getTime() + 3 * 86400_000);
  const in1 = new Date(now.getTime() + 1 * 86400_000);

  // Expired → downgrade
  const expired = await db
    .update(users)
    .set({
      plan: "free",
      planExpiresAt: null,
      showAds: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        sql`${users.plan} <> 'free'`,
        sql`${users.planExpiresAt} IS NOT NULL`,
        lt(users.planExpiresAt, now)
      )
    )
    .returning({ id: users.id, plan: users.plan });

  for (const u of expired) {
    await db.insert(planHistory).values({
      userId: u.id,
      toPlan: "free",
      reason: "expired",
    });
  }

  // Warnings — would dispatch email via outbox/email lib.
  // (Email payload prepared here; actual send wired in Wave 9 templates.)
  const warningWindows = [
    { window: in7, label: "7d" },
    { window: in3, label: "3d" },
    { window: in1, label: "1d" },
  ];
  let warned = 0;
  for (const w of warningWindows) {
    const candidates = await db
      .select({ id: users.id, email: users.email, name: users.name, plan: users.plan, exp: users.planExpiresAt })
      .from(users)
      .where(
        and(
          sql`${users.plan} <> 'free'`,
          sql`${users.planExpiresAt} IS NOT NULL`,
          gt(users.planExpiresAt, now),
          lt(users.planExpiresAt, w.window)
        )
      )
      .limit(200);
    warned += candidates.length;
    // TODO: enqueue email via outbox in Wave 9
    for (const c of candidates) {
      log.info("plan expiry warning", { userId: c.id, window: w.label, exp: c.exp });
    }
  }

  return NextResponse.json({ expired: expired.length, warned });
}
