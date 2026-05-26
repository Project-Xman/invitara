/**
 * Public gallery: GET approved photos, POST guest upload.
 */

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "~/lib/drizzle";
import { invitations, galleryPhotos, guests } from "~/lib/schema";
import { and, desc, eq } from "drizzle-orm";
import { env } from "~/lib/env";
import { verifyTurnstile } from "~/lib/turnstile";
import { assertRateLimit } from "~/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const [inv] = await db
    .select({ id: invitations.id, enabled: invitations.galleryEnabled })
    .from(invitations)
    .where(eq(invitations.slug, slug))
    .limit(1);
  if (!inv || !inv.enabled) return NextResponse.json({ photos: [] });
  const rows = await db
    .select({
      id: galleryPhotos.id,
      url: galleryPhotos.url,
      thumb: galleryPhotos.thumbnailUrl,
      caption: galleryPhotos.caption,
      uploader: galleryPhotos.uploaderName,
      createdAt: galleryPhotos.createdAt,
    })
    .from(galleryPhotos)
    .where(and(eq(galleryPhotos.invitationId, inv.id), eq(galleryPhotos.approved, true)))
    .orderBy(desc(galleryPhotos.createdAt))
    .limit(200);
  return NextResponse.json({ photos: rows });
}

export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const [inv] = await db
    .select({
      id: invitations.id,
      enabled: invitations.galleryEnabled,
      accepts: invitations.galleryAcceptsUploads,
    })
    .from(invitations)
    .where(eq(invitations.slug, slug))
    .limit(1);
  if (!inv || !inv.enabled || !inv.accepts) {
    return NextResponse.json({ error: "Gallery not accepting uploads" }, { status: 403 });
  }

  try {
    await assertRateLimit("gallery-ip", ip, { limit: 5, windowMs: 60_000 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 429 });
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const uploaderName = (form.get("uploaderName") as string | null) ?? null;
  const guestSlug = (form.get("guestSlug") as string | null) ?? null;
  const caption = (form.get("caption") as string | null) ?? null;
  const tsToken = (form.get("turnstileToken") as string | null) ?? null;

  if (env.isProd) {
    const verified = await verifyTurnstile(tsToken, ip);
    if (!verified) return NextResponse.json({ error: "CAPTCHA failed" }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
  }
  if (!env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  let uploaderGuestId: string | null = null;
  if (guestSlug) {
    const [g] = await db
      .select({ id: guests.id })
      .from(guests)
      .where(and(eq(guests.invitationId, inv.id), eq(guests.guestSlug, guestSlug)))
      .limit(1);
    if (g) uploaderGuestId = g.id;
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const blob = await put(`invitara/gallery/${inv.id}/${Date.now()}.${ext}`, file, {
    access: "public",
    token: env.BLOB_READ_WRITE_TOKEN,
  });

  await db.insert(galleryPhotos).values({
    invitationId: inv.id,
    uploaderName,
    uploaderGuestId,
    url: blob.url,
    caption,
    approved: false,
  });

  return NextResponse.json({ ok: true, pending: true });
}
