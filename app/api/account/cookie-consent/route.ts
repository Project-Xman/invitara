import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/lib/drizzle";
import { users } from "~/lib/schema";
import { eq } from "drizzle-orm";
import { validateSession } from "~/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("invitara_token")?.value ?? null;
  if (!token) return NextResponse.json({ ok: true });
  const user = await validateSession(token);
  if (!user) return NextResponse.json({ ok: true });

  await db.update(users).set({ cookieConsentAt: new Date() }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
