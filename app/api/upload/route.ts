import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "~/lib/auth";
import { env } from "~/lib/env";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: Request) {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("invitara_token")?.value ?? null;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await validateSession(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "File storage not configured. Set BLOB_READ_WRITE_TOKEN." },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as "photo" | "music" | null;

  if (!file || !type) {
    return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
  }

  const isPhoto = type === "photo";
  const isMusic = type === "music";
  const allowedTypes = isPhoto ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
  const maxSize = isPhoto ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE;

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}` },
      { status: 400 }
    );
  }

  if (file.size > maxSize) {
    const mb = maxSize / 1024 / 1024;
    return NextResponse.json({ error: `File too large. Max size: ${mb}MB` }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? (isPhoto ? "jpg" : "mp3");
  const path = `invitara/${user.id}/${type}s/${Date.now()}.${ext}`;

  const blob = await put(path, file, {
    access: "public",
    token: env.BLOB_READ_WRITE_TOKEN,
  });

  return NextResponse.json({ url: blob.url });
}
