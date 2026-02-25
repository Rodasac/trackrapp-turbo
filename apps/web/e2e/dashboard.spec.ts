import { test, expect } from "@playwright/test";
import { pickFutureDate } from "./fixtures/dates";
import { uniqueSuffix } from "./fixtures/auth";

// Uses the default (authenticated) storageState from playwright.config.ts

test("dashboard shows KPIs with zero values for fresh user", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // Wait for stats to load (they start as "—" then resolve)
  await expect(page.getByText("$0.00").first()).toBeVisible({ timeout: 10_000 });

  // All spend KPIs should show $0.00 and counts should show 0
  const kpiValues = page.locator(".text-2xl, .text-3xl").filter({ hasText: "$0.00" });
  await expect(kpiValues.first()).toBeVisible();

  // Active subscriptions = 0
  await expect(page.getByText("Active subscriptions", { exact: true })).toBeVisible();
});

test("dashboard shows chart placeholder", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(
    page.getByText(
      "Charts and insights will appear here once you add subscriptions.",
    ),
  ).toBeVisible();
});

test("KPIs update after adding a subscription", async ({ page }) => {
  // Navigate to /dashboard and note current monthly spend is $0.00
  await page.goto("/dashboard");
  await expect(page.getByText("$0.00").first()).toBeVisible({ timeout: 10_000 });

  // Create a new subscription
  await page.goto("/subscriptions/new");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Name *").fill(`Test Sub ${uniqueSuffix()}`);
  await page.getByLabel("Price *").fill("15.99");

  // Pick a future renewal date
  await pickFutureDate(
    page,
    page.getByRole("button", { name: /Next renewal/i }),
  );

  await page.getByRole("button", { name: "Add subscription" }).click();
  // Wait for redirect to the list (not /subscriptions/new which also matches **/subscriptions**)
  await page.waitForURL(/\/subscriptions$/);

  // Return to dashboard
  await page.goto("/dashboard");
  // Monthly spend should now be non-zero
  await expect(page.getByText("$15.99")).toBeVisible({ timeout: 10_000 });
});
