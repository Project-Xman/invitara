/**
 * Seeds a local admin user for development.
 *
 * Admin rights are granted purely by email: `isSuperAdmin()` checks membership
 * in SUPERADMIN_EMAILS. So this creates a normal user whose email is the first
 * entry in that list — no separate "admin" flag exists on the users table.
 *
 * Refuses to run against a non-local database. Creating a known-password admin
 * on a shared or production DB would be handing out the keys.
 */
import bcrypt from "bcryptjs";
import postgres from "postgres";

const DEFAULT_EMAIL = "admin@example.com";
const DEFAULT_PASSWORD = "Admin@12345";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

const host = new URL(databaseUrl).hostname;
const isLocal = host === "localhost" || host === "127.0.0.1" || host === "::1";
if (!isLocal) {
  console.error(
    `❌ Refusing to seed an admin: DATABASE_URL points at "${host}", not localhost.\n` +
      `   This script only ever runs against a local dev database.`,
  );
  process.exit(1);
}

const email = (process.env.SUPERADMIN_EMAILS ?? DEFAULT_EMAIL).split(",")[0].trim() || DEFAULT_EMAIL;
const password = process.env.DEV_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;

const sql = postgres(databaseUrl, { onnotice: () => {} });

const passwordHash = await bcrypt.hash(password, 12);

// Re-running dev:stack must not fail on an existing admin, and must reset the
// password back to the known dev one if it drifted.
await sql`
  INSERT INTO users (email, password_hash, name, email_verified, plan, credits)
  VALUES (${email}, ${passwordHash}, 'Dev Admin', true, 'royal', 999)
  ON CONFLICT (email) DO UPDATE
    SET password_hash = ${passwordHash}, email_verified = true
`;

await sql.end();

console.log(`  ✅ admin ready → ${email} / ${password}`);
