/**
 * Admin Pro feature access E2E tests.
 *
 * Verifies that admin users can access Pro-gated features without a Stripe
 * subscription: dashboard charts, CSV import, and AI tips page.
 */
import { test, expect } from "@playwright/test";
import { signUpNewUser, setUserRole } from "./fixtures/auth";

// Fresh context — no existing session or subscription
test.use({ storageState: { cookies: [], origins: [] } });

test("admin user sees dashboard charts (not upgrade prompt)", async ({
  page,
}) => {
  const { email } = await signUpNewUser(page);
  await setUserRole(page, email, "admin");

  // Reload to pick up new role from session
  await page.goto("/dashboard");

  // Admin should NOT see the "Spending Analytics" Pro upgrade card
  await expect(page.getByRole("link", { name: /view plans/i })).not.toBeVisible(
    { timeout: 10_000 },
  );
});

test("admin user can access CSV import page", async ({ page }) => {
  const { email } = await signUpNewUser(page);
  await setUserRole(page, email, "admin");

  await page.goto("/subscriptions/import");

  // Admin should see the import UI, not the Pro gate
  await expect(page.getByText(/drag & drop/i)).toBeVisible({ timeout: 10_000 });
  // The "View plans" upgrade link should NOT be visible
  await expect(
    page.getByRole("link", { name: /view plans/i }),
  ).not.toBeVisible();
});

test("admin user sees tips without upgrade prompt", async ({ page }) => {
  const { email } = await signUpNewUser(page);
  await setUserRole(page, email, "admin");

  await page.goto("/tips");

  // Admin should NOT see the "Upgrade to Pro" link on the tips page
  await expect(
    page.getByRole("link", { name: /upgrade to pro/i }),
  ).not.toBeVisible({ timeout: 10_000 });
});
