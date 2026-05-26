import { describe, it, expect } from "vitest";
import { rateLimit, RL } from "~/lib/rate-limit";

describe("rateLimit", () => {
  it("allows up to limit", async () => {
    const id = `test-${Date.now()}`;
    for (let i = 0; i < RL.login.limit; i++) {
      const r = await rateLimit("test-login", id, RL.login);
      expect(r.success).toBe(true);
    }
  });

  it("blocks past limit", async () => {
    const id = `test-block-${Date.now()}`;
    for (let i = 0; i < RL.login.limit; i++) {
      await rateLimit("test-block", id, RL.login);
    }
    const r = await rateLimit("test-block", id, RL.login);
    expect(r.success).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("isolates by identifier", async () => {
    await rateLimit("ns", "user-a", { limit: 1, windowMs: 60_000 });
    const r = await rateLimit("ns", "user-b", { limit: 1, windowMs: 60_000 });
    expect(r.success).toBe(true);
  });
});
