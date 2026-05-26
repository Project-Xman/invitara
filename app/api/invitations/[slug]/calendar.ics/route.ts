/**
 * iCalendar (.ics) export for an invitation.
 * Includes the main wedding event plus all sub-events.
 */

import { db } from "~/lib/drizzle";
import { invitations, events as eventsTable } from "~/lib/schema";
import { asc, eq } from "drizzle-orm";

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function toIcsDate(d: Date): string {
  return (
    d.getUTCFullYear().toString().padStart(4, "0") +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0") +
    "T" +
    String(d.getUTCHours()).padStart(2, "0") +
    String(d.getUTCMinutes()).padStart(2, "0") +
    String(d.getUTCSeconds()).padStart(2, "0") +
    "Z"
  );
}

function parseEventDateTime(date?: string | null, time?: string | null): Date | null {
  if (!date) return null;
  const iso = time ? `${date}T${time}` : date;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const [inv] = await db.select().from(invitations).where(eq(invitations.slug, slug)).limit(1);
  if (!inv || !inv.published) {
    return new Response("Not found", { status: 404 });
  }
  const subEvents = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.invitationId, inv.id))
    .orderBy(asc(eventsTable.sortOrder));

  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Invitara//Wedding//EN", "CALSCALE:GREGORIAN");

  const pushEvent = (uid: string, summary: string, dt: Date, durationHours: number, location?: string, description?: string) => {
    const dtend = new Date(dt.getTime() + durationHours * 3600_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}@invitara`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(dt)}`,
      `DTEND:${toIcsDate(dtend)}`,
      `SUMMARY:${icsEscape(summary)}`,
      location ? `LOCATION:${icsEscape(location)}` : "",
      description ? `DESCRIPTION:${icsEscape(description)}` : "",
      "END:VEVENT"
    );
  };

  const couple = `${inv.groomName} & ${inv.brideName}`;
  if (inv.weddingDate) {
    pushEvent(
      `${inv.id}-main`,
      `${couple} — Wedding`,
      new Date(inv.weddingDate),
      4,
      inv.venue ?? undefined,
      inv.message ?? undefined
    );
  }

  for (const e of subEvents) {
    const dt = parseEventDateTime(e.date, e.time);
    if (!dt) continue;
    pushEvent(`${inv.id}-${e.id}`, `${couple} — ${e.name}`, dt, 3, e.venue ?? undefined);
  }

  lines.push("END:VCALENDAR");
  const body = lines.filter(Boolean).join("\r\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
