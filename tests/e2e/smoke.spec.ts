import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("landing renders", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Invitara/i);
  });

  test("templates page loads", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.locator("body")).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("body")).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.locator("input[type='email']").first()).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("input[type='email']").first()).toBeVisible();
  });

  test("404 page", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist-xyz");
    expect(res?.status()).toBe(404);
  });
});
