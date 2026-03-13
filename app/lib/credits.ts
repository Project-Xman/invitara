import { db } from "./drizzle";
import { users, creditTransactions, creditPackages, payments } from "./schema";
import { eq, desc } from "drizzle-orm";

// ━━━ CHECK BALANCE ━━━
export async function getCredits(userId: string): Promise<number> {
  const [user] = await db.select({ credits: users.credits }).from(users).where(eq(users.id, userId));
  return user?.credits ?? 0;
}

// ━━━ DEBIT CREDITS ━━━
export async function debitCredits(userId: string, amount: number, reason: string, refId?: string): Promise<boolean> {
  const balance = await getCredits(userId);
  if (balance < amount) return false;

  const newBalance = balance - amount;
  await db.update(users).set({ credits: newBalance, updatedAt: new Date() }).where(eq(users.id, userId));
  await db.insert(creditTransactions).values({
    userId,
    amount: -amount,
    balance: newBalance,
    reason,
    referenceId: refId,
  });
  return true;
}

// ━━━ ADD CREDITS ━━━
export async function addCredits(userId: string, amount: number, reason: string, refId?: string): Promise<number> {
  const balance = await getCredits(userId);
  const newBalance = balance + amount;
  await db.update(users).set({ credits: newBalance, updatedAt: new Date() }).where(eq(users.id, userId));
  await db.insert(creditTransactions).values({
    userId,
    amount,
    balance: newBalance,
    reason,
    referenceId: refId,
  });
  return newBalance;
}

// ━━━ CREDIT HISTORY ━━━
export async function getCreditHistory(userId: string, limit = 20) {
  return db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit);
}

// ━━━ CREDIT PACKAGES ━━━
export async function getCreditPackages() {
  return db.select().from(creditPackages).where(eq(creditPackages.active, true));
}

// ━━━ PURCHASE CREDITS ━━━
export async function purchaseCredits(userId: string, packageId: number, paymentId: string) {
  const [pkg] = await db.select().from(creditPackages).where(eq(creditPackages.id, packageId));
  if (!pkg) throw new Error("Package not found");

  // Record payment
  await db.insert(payments).values({
    userId,
    type: "credits",
    amount: String(pkg.priceInr),
    currency: "INR",
    status: "completed",
    razorpayPaymentId: paymentId,
    metadata: { packageId, credits: pkg.credits },
  });

  // Add credits
  const newBalance = await addCredits(userId, pkg.credits, `Purchased ${pkg.name} pack`, paymentId);
  return { credits: pkg.credits, newBalance };
}

// ━━━ DEFAULT CREDIT PACKAGES ━━━
export const DEFAULT_CREDIT_PACKAGES = [
  { name: "Starter Pack", credits: 5, priceInr: 99, popular: false },
  { name: "Creator Pack", credits: 15, priceInr: 249, popular: true },
  { name: "Pro Pack", credits: 50, priceInr: 699, popular: false },
  { name: "Studio Pack", credits: 150, priceInr: 1499, popular: false },
];

// ━━━ CREDIT COSTS ━━━
export const CREDIT_COSTS = {
  AI_DESIGN_GENERATE: 1,
  AI_DESIGN_PREMIUM: 2,
  AI_COLOR_PALETTE: 1,
  AI_CONTENT_WRITE: 1,
} as const;
