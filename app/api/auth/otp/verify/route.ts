import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "~/lib/drizzle";
import { users } from "~/lib/schema";
import { eq } from "drizzle-orm";
import { verifyOtp } from "~/lib/otp";
import { createSession } from "~/lib/auth";
import { assertRateLimit, RL } from "~/lib/rate-limit";

const schema = z.object({
  phone: z.string().min(8).max(20),
  code: z.string().length(6),
  purpose: z.enum(["login", "phone_verify"]).default("login"),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  try {
    await assertRateLimit("otp-verify-phone", parsed.data.phone, RL.otpVerify);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 429 });
  }

  const matched = await verifyOtp(parsed.data.phone, parsed.data.code, parsed.data.purpose);
  if (!matched) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });

  if (parsed.data.purpose === "phone_verify") {
    // Mark current authenticated user's phone as verified
    const cookieStore = await cookies();
    const token = cookieStore.get("invitara_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    // We trust verifyOtp matched; identifier is the phone, but a user might be authed.
    // Update the user record matching this phone.
    await db
      .update(users)
      .set({ phone: parsed.data.phone, phoneVerified: true, updatedAt: new Date() })
      .where(eq(users.phone, parsed.data.phone));
    return NextResponse.json({ ok: true });
  }

  // login by phone — find or create user
  let [user] = await db.select().from(users).where(eq(users.phone, parsed.data.phone)).limit(1);
  if (!user) {
    if (!parsed.data.name) {
      return NextResponse.json({ error: "Name required for new account", needsName: true }, { status: 400 });
    }
    // Synthesize email since column is non-null unique
    const synth = `${parsed.data.phone.replace(/\D/g, "")}@phone.invitara.local`;
    const [created] = await db
      .insert(users)
      .values({
        name: parsed.data.name,
        email: synth,
        passwordHash: "",
        phone: parsed.data.phone,
        phoneVerified: true,
      })
      .returning();
    user = created;
  } else if (!user.phoneVerified) {
    await db.update(users).set({ phoneVerified: true }).where(eq(users.id, user.id));
  }

  if (user.banned) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  const { token } = await createSession(user.id, ip);
  const cookieStore = await cookies();
  cookieStore.set("invitara_token", token, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return NextResponse.json({ ok: true, userId: user.id });
}
