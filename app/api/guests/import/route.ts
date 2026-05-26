import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "~/lib/auth";
import { bulkImportGuests, parseGuestCsv } from "~/lib/guests";
import { assertRateLimit, RL } from "~/lib/rate-limit";
import { log } from "~/lib/logger";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_ROWS = 5000;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("invitara_token")?.value ?? null;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    await assertRateLimit("guest-import", user.id, RL.bulkSend);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 429 });
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const invitationId = form.get("invitationId") as string | null;
  if (!file || !invitationId) {
    return NextResponse.json({ error: "Missing file or invitationId" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "CSV too large (max 2MB)" }, { status: 413 });
  }
  const text = await file.text();
  let rows;
  try {
    rows = parseGuestCsv(text);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Too many rows (max ${MAX_ROWS})` }, { status: 400 });
  }
  try {
    const inserted = await bulkImportGuests(user.id, invitationId, rows);
    return NextResponse.json({ inserted, total: rows.length });
  } catch (err: any) {
    log.error("guest import failed", { err: String(err), userId: user.id });
    return NextResponse.json({ error: err.message ?? "Import failed" }, { status: 500 });
  }
}
