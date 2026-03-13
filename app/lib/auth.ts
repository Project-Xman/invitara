import { db } from "./drizzle";
import { users, sessions } from "./schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "invitara-golden-wedding-secret-key-2026");

// ━━━ SCHEMAS ━━━
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// ━━━ PASSWORD UTILS ━━━
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ━━━ JWT UTILS ━━━
export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string };
  } catch {
    return null;
  }
}

// ━━━ SESSION MANAGEMENT ━━━
export async function createSession(userId: string, ip?: string, ua?: string) {
  const token = await createToken(userId);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const [session] = await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
    ipAddress: ip,
    userAgent: ua,
  }).returning();
  return { session, token };
}

export async function validateSession(token: string) {
  const payload = await verifyToken(token);
  if (!payload) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!session) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user || null;
}

export async function invalidateSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

// ━━━ USER REGISTRATION ━━━
export async function registerUser(data: z.infer<typeof registerSchema>) {
  const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0) throw new Error("Email already registered");

  const passwordHash = await hashPassword(data.password);
  const [user] = await db.insert(users).values({
    name: data.name,
    email: data.email,
    passwordHash,
    phone: data.phone,
    plan: "free",
    credits: 3, // Free credits on signup
    showAds: true,
  }).returning();

  return user;
}

// ━━━ USER LOGIN ━━━
export async function loginUser(data: z.infer<typeof loginSchema>) {
  const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (!user) throw new Error("Invalid credentials");

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  return user;
}

// ━━━ GET USER WITH PLAN INFO ━━━
export async function getUserWithPlan(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;
  return {
    ...user,
    isPaid: user.plan !== "free",
    showAds: user.plan === "free",
  };
}

// ━━━ SAFE USER (no password hash) ━━━
export type SafeUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  plan: "free" | "starter" | "premium" | "royal";
  credits: number;
  showAds: boolean;
  createdAt: Date;
};

export function toSafeUser(user: typeof users.$inferSelect): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    plan: user.plan,
    credits: user.credits,
    showAds: user.showAds,
    createdAt: user.createdAt,
  };
}
