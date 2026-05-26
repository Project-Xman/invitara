/**
 * GDPR / DPDP data export. Returns JSON dump of current user's data.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/lib/drizzle";
import {
  users,
  invitations,
  events as eventsTable,
  rsvps,
  guests,
  wishes,
  payments,
  creditTransactions,
  templatePurchases,
} from "~/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { validateSession, toSafeUser } from "~/lib/auth";

export async function GET(_request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("invitara_token")?.value ?? null;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userRaw = await validateSession(token);
  if (!userRaw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = toSafeUser(userRaw);
  const userInvites = await db.select().from(invitations).where(eq(invitations.userId, userRaw.id));
  const inviteIds = userInvites.map((i) => i.id);

  const fetchByInviteIds = async <T,>(
    fetcher: () => Promise<T[]>
  ): Promise<T[]> => (inviteIds.length ? fetcher() : Promise.resolve([]));

  const [evs, rs, gs, ws, ps, cts, tps] = await Promise.all([
    fetchByInviteIds(() => db.select().from(eventsTable).where(inArray(eventsTable.invitationId, inviteIds))),
    fetchByInviteIds(() => db.select().from(rsvps).where(inArray(rsvps.invitationId, inviteIds))),
    fetchByInviteIds(() => db.select().from(guests).where(inArray(guests.invitationId, inviteIds))),
    fetchByInviteIds(() => db.select().from(wishes).where(inArray(wishes.invitationId, inviteIds))),
    db.select().from(payments).where(eq(payments.userId, userRaw.id)),
    db.select().from(creditTransactions).where(eq(creditTransactions.userId, userRaw.id)),
    db.select().from(templatePurchases).where(eq(templatePurchases.userId, userRaw.id)),
  ]);

  const dump = {
    exportedAt: new Date().toISOString(),
    user,
    invitations: userInvites,
    events: evs,
    rsvps: rs,
    guests: gs,
    wishes: ws,
    payments: ps,
    creditTransactions: cts,
    templatePurchases: tps,
  };

  return new Response(JSON.stringify(dump, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="invitara-data-${userRaw.id}.json"`,
    },
  });
}
