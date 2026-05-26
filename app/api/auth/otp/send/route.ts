import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOtp } from "~/lib/otp";
import { assertRateLimit, RL } from "~/lib/rate-limit";
import { verifyTurnstile } from "~/lib/turnstile";
import { env } from "~/lib/env";

const schema = z.object({
  phone: z.string().min(8).max(20),
  purpose: z.enum(["login", "phone_verify"]).default("login"),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const verified = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (env.isProd && !verified) {
    return NextResponse.json({ error: "CAPTCHA failed" }, { status: 400 });
  }

  try {
    await assertRateLimit("otp-send-phone", parsed.data.phone, RL.otpSend);
    await assertRateLimit("otp-send-ip", ip, { limit: 10, windowMs: 60_000 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 429 });
  }

  const r = await sendOtp(parsed.data.phone, parsed.data.purpose, ip);
  return NextResponse.json(r, { status: r.ok ? 200 : 503 });
}
