/**
 * Public guestbook. Submit wish (POST) + list approved wishes (GET).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/lib/drizzle";
import { invitations, wishes, guests } from "~/lib/schema";
import { and, desc, eq } from "drizzle-orm";
import { verifyTurnstile } from "~/lib/turnstile";
import { assertRateLimit, RL } from "~/lib/rate-limit";
import { env } from "~/lib/env";

const submitSchema = z.object({
  name: z.string().min(1).max(120),
  message: z.string().min(1).max(1000),
  guestSlug: z.string().optional(),
  turnstileToken: z.string().optional(),
});

const PROFANITY = /\b(fuck|shit|cunt|fag|nigger)\b/i;

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const [inv] = await db
    .select({
      id: invitations.id,
      guestbookEnabled: invitations.guestbookEnabled,
      requiresApproval: invitations.guestbookRequiresApproval,
    })
    .from(invitations)
    .where(eq(invitations.slug, slug))
    .limit(1);
  if (!inv || !inv.guestbookEnabled) return NextResponse.json({ wishes: [] });

  const rows = await db
    .select({ id: wishes.id, name: wishes.name, message: wishes.message, createdAt: wishes.createdAt })
    .from(wishes)
    .where(and(eq(wishes.invitationId, inv.id), eq(wishes.approved, true)))
    .orderBy(desc(wishes.createdAt))
    .limit(200);

  return NextResponse.json({ wishes: rows });
}

export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (env.isProd) {
    const verified = await verifyTurnstile(parsed.data.turnstileToken, ip);
    if (!verified) return NextResponse.json({ error: "CAPTCHA failed" }, { status: 400 });
  }
  try {
    await assertRateLimit("wish-ip", ip, RL.wishSubmit);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 429 });
  }

  const [inv] = await db
    .select({
      id: invitations.id,
      guestbookEnabled: invitations.guestbookEnabled,
      requiresApproval: invitations.guestbookRequiresApproval,
    })
    .from(invitations)
    .where(eq(invitations.slug, slug))
    .limit(1);
  if (!inv || !inv.guestbookEnabled) return NextResponse.json({ error: "Disabled" }, { status: 403 });

  let guestId: string | null = null;
  if (parsed.data.guestSlug) {
    const [g] = await db
      .select({ id: guests.id })
      .from(guests)
      .where(and(eq(guests.invitationId, inv.id), eq(guests.guestSlug, parsed.data.guestSlug)))
      .limit(1);
    if (g) guestId = g.id;
  }

  const flagged = PROFANITY.test(parsed.data.message);
  const autoApproved = !inv.requiresApproval && !flagged;

  await db.insert(wishes).values({
    invitationId: inv.id,
    guestId,
    name: parsed.data.name,
    message: parsed.data.message,
    approved: autoApproved,
    flagged,
    ipAddress: ip,
  });

  return NextResponse.json({ ok: true, pending: !autoApproved });
}
