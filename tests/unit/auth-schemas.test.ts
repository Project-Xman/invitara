import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, hashPassword, verifyPassword } from "~/lib/auth";

describe("registerSchema", () => {
  it("rejects short password", () => {
    const r = registerSchema.safeParse({ name: "A B", email: "a@b.com", password: "12345" });
    expect(r.success).toBe(false);
  });
  it("accepts valid", () => {
    const r = registerSchema.safeParse({ name: "Priya", email: "p@x.com", password: "secret123" });
    expect(r.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("requires email format", () => {
    const r = loginSchema.safeParse({ email: "not-email", password: "x" });
    expect(r.success).toBe(false);
  });
});

describe("password hashing", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("secret123", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
