/**
 * Personalized guest link. Tracks open, then redirects to invite page
 * with the guest slug in querystring so RSVP can pre-fill.
 *
 * URL form: /g/<invitationSlug>/<guestSlug>
 */

import { NextResponse } from "next/server";
import { trackGuestOpen } from "~/lib/guests";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string; guestSlug: string }> }
) {
  const { slug, guestSlug } = await ctx.params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
  await trackGuestOpen({ invitationSlug: slug, guestSlug, ip });

  const dest = new URL(`/invite/${slug}`, request.url);
  dest.searchParams.set("g", guestSlug);
  return NextResponse.redirect(dest, 302);
}
