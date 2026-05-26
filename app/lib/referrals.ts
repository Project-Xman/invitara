/**
 * Referral program.
 *
 *   - Each user gets a unique referral code on demand.
 *   - When a new signup carries ?ref=CODE, link is recorded.
 *   - On signup: both parties earn signup credits.
 *   - On referred user's first purchase: referrer earns purchase credits.
 */

import { db } from "./drizzle";
import { users, referrals } from "./schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { addCredits } from "./credits";
import { log } from "./logger";

const SIGNUP_CREDITS_FOR_REFERRER = 2;
const SIGNUP_CREDITS_FOR_REFERRED = 2;
const PURCHASE_CREDITS_FOR_REFERRER = 5;

export async function ensureReferralCode(userId: string): Promise<string> {
  const [u] = await db.select({ code: users.referralCode }).from(users).where(eq(users.id, userId));
  if (u?.code) return u.code;

  for (let i = 0; i < 5; i++) {
    const code = randomBytes(4).toString("hex").toUpperCase();
    try {
      await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
      return code;
    } catch (err: any) {
      if (err?.code !== "23505") throw err;
    }
  }
  throw new Error("Could not generate referral code");
}

export async function findUserByReferralCode(code: string) {
  if (!code) return null;
  const [u] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.referralCode, code.toUpperCase()))
    .limit(1);
  return u ?? null;
}

/**
 * Called on new user registration with ?ref=CODE. Records link + credits both parties.
 */
export async function applyReferralOnSignup(referredUserId: string, code: string): Promise<void> {
  const referrer = await findUserByReferralCode(code);
  if (!referrer) return;
  if (referrer.id === referredUserId) return; // self-refer guard

  try {
    await db.insert(referrals).values({
      referrerUserId: referrer.id,
      referredUserId,
      code: code.toUpperCase(),
      signupRewardStatus: "credited",
      signupCreditsAwarded: SIGNUP_CREDITS_FOR_REFERRER,
    });
    await db
      .update(users)
      .set({ referredByUserId: referrer.id })
      .where(eq(users.id, referredUserId));
    await Promise.all([
      addCredits(referrer.id, SIGNUP_CREDITS_FOR_REFERRER, `referral:signup:${referredUserId}`),
      addCredits(referredUserId, SIGNUP_CREDITS_FOR_REFERRED, `referral:signup-bonus:${referrer.id}`),
    ]);
    log.info("referral signup credited", { referrer: referrer.id, referred: referredUserId });
  } catch (err: any) {
    if (err?.code === "23505") return; // dup
    log.error("applyReferralOnSignup", { err: String(err) });
  }
}

/**
 * Called on referred user's first paid purchase.
 */
export async function applyReferralOnPurchase(referredUserId: string): Promise<void> {
  const [link] = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referredUserId, referredUserId))
    .limit(1);
  if (!link || link.purchaseRewardStatus !== "pending") return;

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(referrals)
        .set({
          purchaseRewardStatus: "credited",
          purchaseCreditsAwarded: PURCHASE_CREDITS_FOR_REFERRER,
        })
        .where(eq(referrals.id, link.id));
    });
    await addCredits(link.referrerUserId, PURCHASE_CREDITS_FOR_REFERRER, `referral:purchase:${referredUserId}`);
    log.info("referral purchase credited", { referrer: link.referrerUserId, referred: referredUserId });
  } catch (err) {
    log.error("applyReferralOnPurchase", { err: String(err) });
  }
}
