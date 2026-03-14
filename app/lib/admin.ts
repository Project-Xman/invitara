import { env } from "./env";

export function isSuperAdmin(email: string): boolean {
  if (!env.SUPERADMIN_EMAILS) return false;
  const adminEmails = env.SUPERADMIN_EMAILS
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}
