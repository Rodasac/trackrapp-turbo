import { test, expect } from "@playwright/test";
import { signUpNewUser } from "./fixtures/auth";
import { UNAUTHENTICATED_STORAGE_STATE } from "./fixtures/consent";

// Each test creates a fresh user (no Stripe subscription)
// Consent cookie pre-set so the blocking banner doesn't interfere
test.use({ storageState: UNAUTHENTICATED_STORAGE_STATE });

test("settings billing tab shows Free plan for a new user", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/settings?tab=billing");

  // Wait for the billing settings to load
  await expect(page.getByText(/free plan/i)).toBeVisible({ timeout: 10_000 });
});

test("settings billing tab shows Upgrade to Pro button for free user", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/settings?tab=billing");

  await expect(
    page.getByRole("button", { name: /upgrade to pro/i }),
  ).toBeVisible({ timeout: 10_000 });
});

test("?tab=billing query param opens the billing tab directly", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/settings?tab=billing");

  // Billing card should be visible (not profile or notifications)
  await expect(page.getByText(/manage your subscription plan/i)).toBeVisible({
    timeout: 10_000,
  });
  // Profile card should not be visible
  await expect(
    page.getByText("Update your name and email address"),
  ).not.toBeVisible();
});

test("pricing page renders both plan cards", async ({ page }) => {
  await page.goto("/pricing");

  // Target the card titles specifically
  await expect(
    page.getByRole("heading", { name: "Simple pricing" }),
  ).toBeVisible();
  await expect(
    page.locator("[data-slot='card-title']").filter({ hasText: "Free" }),
  ).toBeVisible();
  await expect(
    page.locator("[data-slot='card-title']").filter({ hasText: "Pro" }),
  ).toBeVisible();
});

test("pricing page shows monthly price by default", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByText("$4")).toBeVisible();
  await expect(page.getByText("/ month").first()).toBeVisible();
});

test("pricing page monthly/annual toggle switches prices", async ({ page }) => {
  await page.goto("/pricing");

  // Default: monthly
  await expect(page.getByText("$4")).toBeVisible();

  // Click Annual
  await page.getByRole("button", { name: /annual/i }).click();

  // Should show $40/year
  await expect(page.getByText("$40")).toBeVisible();
  await expect(page.getByText(/year/)).toBeVisible();
});

test("pricing page shows Save 17% badge when annual is selected", async ({
  page,
}) => {
  await page.goto("/pricing");

  await page.getByRole("button", { name: /annual/i }).click();

  // Use exact match to target only the toggle badge, not the card subtext
  await expect(page.getByText("Save 17%", { exact: true })).toBeVisible();
});

test("pricing page Start free trial links to /signup when logged out", async ({
  page,
}) => {
  await page.goto("/pricing");

  const link = page.getByRole("link", { name: /start free trial/i });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "/signup?plan=pro");
});

test("tips page shows upgrade prompt for free user", async ({ page }) => {
  await signUpNewUser(page);

  await page.goto("/tips");

  await expect(page.getByText(/ai tips are a pro feature/i)).toBeVisible({
    timeout: 10_000,
  });
  await expect(
    page.getByRole("main").getByRole("link", { name: /upgrade to pro/i }),
  ).toBeVisible();
});

test("tips page shows Pro badge in the heading", async ({ page }) => {
  await signUpNewUser(page);

  await page.goto("/tips");

  await expect(
    page.getByRole("heading", { name: "AI Insights" }),
  ).toBeVisible();
  // Pro badge is visible
  await expect(
    page.getByRole("main").getByText("Pro", { exact: true }),
  ).toBeVisible();
});
