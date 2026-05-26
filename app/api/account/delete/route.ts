/**
 * Schedule account deletion (30-day grace) or cancel a pending deletion.
 *   POST   /api/account/delete   { reason? }   → schedule (30d)
 *   DELETE /api/account/delete                 → cancel scheduled deletion
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/lib/drizzle";
import { users } from "~/lib/schema";
import { eq } from "drizzle-orm";
import { validateSession } from "~/lib/auth";
import { sendAccountDeletionScheduled } from "~/lib/email";
import { env } from "~/lib/env";

const GRACE_DAYS = 30;

export async function POST(_request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("invitara_token")?.value ?? null;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const scheduledFor = new Date(Date.now() + GRACE_DAYS * 86400_000);
  await db.update(users).set({ deletionScheduledAt: scheduledFor }).where(eq(users.id, user.id));

  await sendAccountDeletionScheduled(user.email, {
    userName: user.name,
    scheduledFor,
    cancelUrl: `${env.APP_URL}/account?cancel-deletion=1`,
  });

  return NextResponse.json({ ok: true, scheduledFor: scheduledFor.toISOString() });
}

export async function DELETE(_request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("invitara_token")?.value ?? null;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await db.update(users).set({ deletionScheduledAt: null }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
