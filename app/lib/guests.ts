/**
 * Guest list management: create, list, CSV import, personalized link generation,
 * open + RSVP tracking.
 */

import { db } from "./drizzle";
import { guests, invitations, messageOutbox } from "./schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { log } from "./logger";

export type GuestSide = "groom" | "bride" | "both";

function genSlug(): string {
  return randomBytes(6).toString("base64url");
}

async function assertOwnership(userId: string, invitationId: string) {
  const [inv] = await db
    .select({ id: invitations.id, userId: invitations.userId })
    .from(invitations)
    .where(eq(invitations.id, invitationId))
    .limit(1);
  if (!inv || inv.userId !== userId) throw new Error("Forbidden");
}

export interface GuestInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  side?: GuestSide;
  tags?: string[];
  allowedPlusOnes?: number;
  note?: string | null;
}

export async function addGuest(userId: string, invitationId: string, input: GuestInput) {
  await assertOwnership(userId, invitationId);
  const [g] = await db
    .insert(guests)
    .values({
      invitationId,
      name: input.name,
      phone: input.phone ?? null,
      email: input.email ?? null,
      side: input.side ?? "both",
      tags: input.tags ?? [],
      allowedPlusOnes: input.allowedPlusOnes ?? 0,
      note: input.note ?? null,
      guestSlug: genSlug(),
    })
    .returning();
  return g;
}

export async function listGuests(userId: string, invitationId: string) {
  await assertOwnership(userId, invitationId);
  return db
    .select()
    .from(guests)
    .where(eq(guests.invitationId, invitationId))
    .orderBy(desc(guests.createdAt));
}

export async function deleteGuest(userId: string, guestId: string) {
  const [g] = await db
    .select({ invitationId: guests.invitationId })
    .from(guests)
    .where(eq(guests.id, guestId))
    .limit(1);
  if (!g) return;
  await assertOwnership(userId, g.invitationId);
  await db.delete(guests).where(eq(guests.id, guestId));
}

export async function updateGuest(userId: string, guestId: string, patch: Partial<GuestInput>) {
  const [g] = await db
    .select({ invitationId: guests.invitationId })
    .from(guests)
    .where(eq(guests.id, guestId))
    .limit(1);
  if (!g) throw new Error("Not found");
  await assertOwnership(userId, g.invitationId);

  await db
    .update(guests)
    .set({
      ...(patch.name ? { name: patch.name } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.email !== undefined ? { email: patch.email } : {}),
      ...(patch.side ? { side: patch.side } : {}),
      ...(patch.tags ? { tags: patch.tags } : {}),
      ...(patch.allowedPlusOnes !== undefined ? { allowedPlusOnes: patch.allowedPlusOnes } : {}),
      ...(patch.note !== undefined ? { note: patch.note } : {}),
      updatedAt: new Date(),
    })
    .where(eq(guests.id, guestId));
}

/**
 * Bulk import via parsed CSV rows. Skips invalid/empty names.
 * Returns count inserted.
 */
export async function bulkImportGuests(
  userId: string,
  invitationId: string,
  rows: GuestInput[]
): Promise<number> {
  await assertOwnership(userId, invitationId);
  const valid = rows
    .filter((r) => r.name?.trim())
    .map((r) => ({
      invitationId,
      name: r.name.trim(),
      phone: r.phone?.trim() || null,
      email: r.email?.trim() || null,
      side: (r.side ?? "both") as GuestSide,
      tags: r.tags ?? [],
      allowedPlusOnes: r.allowedPlusOnes ?? 0,
      note: r.note ?? null,
      guestSlug: genSlug(),
    }));
  if (valid.length === 0) return 0;

  // Chunk to avoid statement-size limits
  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < valid.length; i += CHUNK) {
    const part = valid.slice(i, i + CHUNK);
    const result = await db.insert(guests).values(part).returning({ id: guests.id });
    inserted += result.length;
  }
  log.info("bulk guests imported", { userId, invitationId, inserted });
  return inserted;
}

/**
 * Parse CSV text. Supports headers: name, phone, email, side, tags, plus_ones, note.
 * Tags use semicolon-separated values within a column (no commas).
 */
export function parseGuestCsv(csv: string): GuestInput[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];
  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const idx = (k: string) => header.indexOf(k);
  const nameI = idx("name");
  if (nameI === -1) throw new Error("CSV must have a 'name' column");
  const phoneI = idx("phone");
  const emailI = idx("email");
  const sideI = idx("side");
  const tagsI = idx("tags");
  const plusI = idx("plus_ones");
  const noteI = idx("note");

  const rows: GuestInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvRow(lines[i]);
    const name = cells[nameI];
    if (!name) continue;
    rows.push({
      name,
      phone: phoneI >= 0 ? cells[phoneI] : null,
      email: emailI >= 0 ? cells[emailI] : null,
      side:
        sideI >= 0 && ["groom", "bride", "both"].includes(cells[sideI]?.toLowerCase())
          ? (cells[sideI].toLowerCase() as GuestSide)
          : "both",
      tags: tagsI >= 0 && cells[tagsI] ? cells[tagsI].split(";").map((t) => t.trim()).filter(Boolean) : [],
      allowedPlusOnes: plusI >= 0 ? Number(cells[plusI] ?? 0) || 0 : 0,
      note: noteI >= 0 ? cells[noteI] : null,
    });
  }
  return rows;
}

function parseCsvRow(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else {
      if (c === ",") {
        out.push(cur.trim());
        cur = "";
      } else if (c === '"') {
        inQuotes = true;
      } else {
        cur += c;
      }
    }
  }
  out.push(cur.trim());
  return out;
}

export interface GuestOpenInput {
  invitationSlug: string;
  guestSlug: string;
  ip?: string;
}

/**
 * Track guest open. Idempotent — only sets openedAt the first time.
 * Returns guest + invitation, or null if not found.
 */
export async function trackGuestOpen(input: GuestOpenInput) {
  const [row] = await db
    .select({
      guestId: guests.id,
      invitationId: guests.invitationId,
      guestName: guests.name,
      openedAt: guests.openedAt,
      invSlug: invitations.slug,
    })
    .from(guests)
    .innerJoin(invitations, eq(invitations.id, guests.invitationId))
    .where(and(eq(invitations.slug, input.invitationSlug), eq(guests.guestSlug, input.guestSlug)))
    .limit(1);

  if (!row) return null;

  if (!row.openedAt) {
    await db.update(guests).set({ openedAt: new Date() }).where(eq(guests.id, row.guestId));
  }
  return row;
}

/**
 * Enqueue messages for guests via channel. Worker picks them up later.
 */
export async function enqueueBulkInvitations(
  userId: string,
  invitationId: string,
  guestIds: string[],
  channel: "whatsapp" | "sms" | "email",
  templateName: string
): Promise<number> {
  await assertOwnership(userId, invitationId);
  if (guestIds.length === 0) return 0;

  const targets = await db
    .select({
      id: guests.id,
      name: guests.name,
      phone: guests.phone,
      email: guests.email,
      slug: guests.guestSlug,
    })
    .from(guests)
    .where(and(eq(guests.invitationId, invitationId), inArray(guests.id, guestIds)));

  const [inv] = await db
    .select({ slug: invitations.slug })
    .from(invitations)
    .where(eq(invitations.id, invitationId))
    .limit(1);
  if (!inv) throw new Error("Invitation not found");

  const recipientField = channel === "email" ? "email" : "phone";
  const rows = targets
    .filter((t) => t[recipientField as "phone" | "email"])
    .map((t) => ({
      userId,
      invitationId,
      guestId: t.id,
      channel,
      recipient: (t[recipientField as "phone" | "email"] as string).trim(),
      templateName,
      payload: {
        guestName: t.name,
        inviteSlug: inv.slug,
        guestSlug: t.slug,
      } as Record<string, unknown>,
    }));

  if (rows.length === 0) return 0;
  await db.insert(messageOutbox).values(rows);

  // Mark invitations as sent
  await db
    .update(guests)
    .set({ invitationSentAt: new Date(), invitationChannel: channel })
    .where(inArray(guests.id, rows.map((r) => r.guestId!).filter(Boolean) as string[]));

  log.info("bulk enqueued", { userId, invitationId, channel, count: rows.length });
  return rows.length;
}
