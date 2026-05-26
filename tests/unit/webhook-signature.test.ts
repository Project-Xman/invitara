import { describe, it, expect } from "vitest";
import crypto from "node:crypto";

function sign(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

describe("razorpay webhook signature", () => {
  const SECRET = "test-webhook-secret";

  it("accepts valid signature", () => {
    const body = JSON.stringify({ event: "payment.captured" });
    const sig = sign(body, SECRET);
    const expected = sign(body, SECRET);
    const ok =
      Buffer.from(sig, "hex").length === Buffer.from(expected, "hex").length &&
      crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
    expect(ok).toBe(true);
  });

  it("rejects tampered body", () => {
    const original = JSON.stringify({ event: "payment.captured", amount: 1000 });
    const tampered = JSON.stringify({ event: "payment.captured", amount: 999999 });
    const sig = sign(original, SECRET);
    const recomputed = sign(tampered, SECRET);
    expect(sig).not.toBe(recomputed);
  });

  it("rejects wrong secret", () => {
    const body = JSON.stringify({ event: "payment.captured" });
    const sig = sign(body, SECRET);
    const wrong = sign(body, "wrong-secret");
    expect(sig).not.toBe(wrong);
  });
});
