/**
 * Create or reset a system admin account.
 *
 *   ADMIN_EMAIL=you@example.com [ADMIN_PASSWORD=...] npm run db:admin
 *
 * Without ADMIN_PASSWORD a random one is generated and printed once. No password is
 * hardcoded: a known default on a public app is an open door. The email must also be in
 * SUPERADMIN_EMAILS for /admin to open.
 */
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./drizzle";
import { users } from "./schema";
import { hashPassword } from "./auth";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error("Set ADMIN_EMAIL.");
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD ?? randomBytes(12).toString("base64url");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  const passwordHash = await hashPassword(password);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, emailVerified: true, banned: false, updatedAt: new Date() })
      .where(eq(users.id, existing.id));
  } else {
    await db
      .insert(users)
      .values({ email, name: "System Admin", passwordHash, emailVerified: true });
  }

  console.log(`${existing ? "Updated" : "Created"} admin ${email}`);
  if (generated) console.log(`Password (shown once): ${password}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
