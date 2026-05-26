/**
 * Public RSVP submission. Gated by Turnstile + rate limit.
 * Accepts optional guestSlug to link to a personalized invite.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/lib/drizzle";
import { invitations, rsvps, guests } from "~/lib/schema";
import { and, eq } from "drizzle-orm";
import { verifyTurnstile } from "~/lib/turnstile";
import { assertRateLimit, RL } from "~/lib/rate-limit";
import { env } from "~/lib/env";

const schema = z.object({
  name: z.string().min(1).max(200),
  guests: z.number().int().min(1).max(20).default(1),
  status: z.enum(["attending", "pending", "declined"]).default("attending"),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
  message: z.string().max(2000).optional(),
  eventsAttending: z.array(z.string()).default([]),
  guestSlug: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (env.isProd) {
    const verified = await verifyTurnstile(parsed.data.turnstileToken, ip);
    if (!verified) return NextResponse.json({ error: "CAPTCHA failed" }, { status: 400 });
  }

  try {
    await assertRateLimit("rsvp-ip", ip, RL.rsvpSubmit);
    await assertRateLimit("rsvp-slug", slug, { limit: 100, windowMs: 60_000 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 429 });
  }

  const [inv] = await db
    .select({
      id: invitations.id,
      published: invitations.published,
      rsvpEnabled: invitations.rsvpEnabled,
      rsvpDeadline: invitations.rsvpDeadline,
    })
    .from(invitations)
    .where(eq(invitations.slug, slug))
    .limit(1);

  if (!inv || !inv.published) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!inv.rsvpEnabled) return NextResponse.json({ error: "RSVP disabled" }, { status: 403 });
  if (inv.rsvpDeadline && new Date(inv.rsvpDeadline) < new Date()) {
    return NextResponse.json({ error: "RSVP deadline passed" }, { status: 403 });
  }

  const [created] = await db
    .insert(rsvps)
    .values({
      invitationId: inv.id,
      name: parsed.data.name,
      guests: parsed.data.guests,
      status: parsed.data.status,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
      message: parsed.data.message ?? null,
      eventsAttending: parsed.data.eventsAttending,
      respondedAt: new Date(),
    })
    .returning({ id: rsvps.id });

  if (parsed.data.guestSlug) {
    await db
      .update(guests)
      .set({ rsvpAt: new Date() })
      .where(and(eq(guests.invitationId, inv.id), eq(guests.guestSlug, parsed.data.guestSlug)));
  }

  return NextResponse.json({ ok: true, id: created.id });
}
