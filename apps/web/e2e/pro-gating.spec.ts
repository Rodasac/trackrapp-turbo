/**
 * Pro-gating E2E tests — run as a fresh (free) user.
 *
 * Verifies that Pro features are gated in the UI for free users:
 *   - CSV import button hidden on subscriptions page
 *   - /subscriptions/import shows ProFeatureGate
 *   - Dashboard charts section shows upgrade prompt
 *   - Push notification toggle shows "Pro" badge + upgrade link
 */
import { test, expect } from "@playwright/test";
import { signUpNewUser } from "./fixtures/auth";

// Use fresh unauthenticated context so each test gets a true free user
test.use({ storageState: { cookies: [], origins: [] } });

test("CSV import button is NOT visible for free users on subscriptions page", async ({
  page,
}) => {
  await signUpNewUser(page);
  await page.goto("/subscriptions");
  await expect(
    page.getByRole("link", { name: /import csv/i }),
  ).not.toBeVisible();
});

test("/subscriptions/import shows Pro upgrade gate for free users", async ({
  page,
}) => {
  await signUpNewUser(page);
  await page.goto("/subscriptions/import");
  // Should show the ProFeatureGate, not the import flow
  await expect(page.getByText(/view plans/i)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("link", { name: /view plans/i })).toBeVisible();
});

test("dashboard charts section shows upgrade prompt for free users", async ({
  page,
}) => {
  await signUpNewUser(page);
  await page.goto("/dashboard");
  // Free users see Spending Analytics upgrade card, not the charts
  await expect(page.getByText(/spending analytics/i)).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByRole("link", { name: /view plans/i })).toBeVisible();
});

test("push notification toggle in settings shows Pro badge for free users", async ({
  page,
}) => {
  await signUpNewUser(page);
  await page.goto("/settings?tab=notifications");
  // Free users see a Pro badge + Upgrade link instead of the push toggle
  await expect(page.getByText(/pro/i).first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByRole("link", { name: /upgrade/i })).toBeVisible();
});
