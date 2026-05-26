/**
 * Render invoice HTML. Auth-gated.
 *   /api/invoices/<paymentId>          → printable HTML
 *   /api/invoices/<paymentId>?dl=1     → suggests download
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/lib/drizzle";
import { payments } from "~/lib/schema";
import { eq } from "drizzle-orm";
import { validateSession, toSafeUser } from "~/lib/auth";
import { getInvoiceData, renderInvoiceHtml } from "~/lib/invoice";

export async function GET(_req: Request, ctx: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await ctx.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("invitara_token")?.value ?? null;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = await validateSession(token);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [p] = await db.select({ userId: payments.userId }).from(payments).where(eq(payments.id, paymentId)).limit(1);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const safeUser = toSafeUser(user);
  if (p.userId !== user.id && !safeUser.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = await getInvoiceData(paymentId);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const html = renderInvoiceHtml(data);
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=60",
    },
  });
}
