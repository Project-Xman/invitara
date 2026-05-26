/**
 * Coupon redemption logic.
 *
 * applyCoupon: validates a coupon for a (user, type, amount) tuple.
 *   Returns discount amount in the same unit as input (paise/cents).
 *
 * recordRedemption: atomic — locks coupon row, increments counters, inserts redemption.
 */

import { db } from "./drizzle";
import { coupons, couponRedemptions } from "./schema";
import { and, eq, sql } from "drizzle-orm";

export interface ApplyResult {
  valid: boolean;
  discount: number;
  reason?: string;
  couponId?: number;
}

interface ApplyInput {
  code: string;
  userId: string;
  purchaseType: "template" | "credits" | "subscription";
  planId?: string;
  amount: number; // smallest unit (paise)
}

export async function applyCoupon(input: ApplyInput): Promise<ApplyResult> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { valid: false, discount: 0, reason: "Empty code" };

  const [c] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  if (!c || !c.active) return { valid: false, discount: 0, reason: "Invalid coupon" };

  const now = new Date();
  if (c.startsAt && c.startsAt > now) return { valid: false, discount: 0, reason: "Not active yet" };
  if (c.expiresAt && c.expiresAt < now) return { valid: false, discount: 0, reason: "Expired" };
  if (c.maxRedemptions != null && c.redemptions >= c.maxRedemptions) {
    return { valid: false, discount: 0, reason: "Limit reached" };
  }
  if (input.amount < c.minAmount) {
    return { valid: false, discount: 0, reason: `Min spend ₹${c.minAmount / 100}` };
  }

  // Applies-to filter
  const appliesTo = c.appliesTo as { types?: string[]; planIds?: string[] } | null;
  if (appliesTo?.types?.length && !appliesTo.types.includes(input.purchaseType)) {
    return { valid: false, discount: 0, reason: "Not valid for this purchase type" };
  }
  if (input.purchaseType === "subscription" && appliesTo?.planIds?.length && input.planId) {
    if (!appliesTo.planIds.includes(input.planId)) {
      return { valid: false, discount: 0, reason: "Not valid for this plan" };
    }
  }

  // Per-user limit
  const userRedemptions = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(couponRedemptions)
    .where(and(eq(couponRedemptions.couponId, c.id), eq(couponRedemptions.userId, input.userId)));
  if ((userRedemptions[0]?.count ?? 0) >= c.perUserLimit) {
    return { valid: false, discount: 0, reason: "Already used" };
  }

  let discount = 0;
  if (c.discountType === "percent") {
    discount = Math.floor((input.amount * c.discountValue) / 100);
  } else {
    discount = c.discountValue;
  }
  discount = Math.min(discount, input.amount);

  return { valid: true, discount, couponId: c.id };
}

export async function recordRedemption(
  couponId: number,
  userId: string,
  paymentId: string | null,
  discount: number
) {
  return db.transaction(async (tx) => {
    await tx
      .update(coupons)
      .set({ redemptions: sql`${coupons.redemptions} + 1` })
      .where(eq(coupons.id, couponId));
    await tx.insert(couponRedemptions).values({
      couponId,
      userId,
      paymentId,
      discountAmount: discount,
    });
  });
}
