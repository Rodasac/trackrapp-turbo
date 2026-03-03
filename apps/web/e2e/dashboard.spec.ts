import { test, expect, type Page } from "@playwright/test";
import { pickFutureDate } from "./fixtures/dates";
import { signUpNewUser, uniqueSuffix } from "./fixtures/auth";

async function gotoNewSubscription(page: Page): Promise<void> {
  const categoriesReady = page.waitForResponse(
    (r) => r.url().includes("/api/categories") && r.status() === 200,
    { timeout: 15_000 },
  );
  await page.goto("/subscriptions/new");
  await categoriesReady;
}

// Each test in this file uses a fresh user to avoid shared-state ordering
// dependencies with other spec files that create subscriptions.
test.use({ storageState: { cookies: [], origins: [] } });

test("dashboard shows KPIs with zero values for fresh user", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // Wait for stats to load (they start as "—" then resolve)
  await expect(page.getByText("$0.00").first()).toBeVisible({
    timeout: 10_000,
  });

  // All spend KPIs should show $0.00
  const kpiValues = page
    .locator(".text-2xl, .text-3xl")
    .filter({ hasText: "$0.00" });
  await expect(kpiValues.first()).toBeVisible();

  // Active subscriptions = 0
  await expect(
    page.getByText("Active subscriptions", { exact: true }),
  ).toBeVisible();
});

// B1 fix: free users see the Pro upgrade card for charts
test("dashboard shows charts upgrade prompt for free users", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/dashboard");
  // Free users see the Spending Analytics upgrade card, not the charts
  await expect(page.getByText(/spending analytics/i)).toBeVisible({
    timeout: 10_000,
  });
});

test("KPIs update after adding a subscription", async ({ page }) => {
  await signUpNewUser(page);

  // Confirm zero state first
  await page.goto("/dashboard");
  await expect(page.getByText("$0.00").first()).toBeVisible({
    timeout: 10_000,
  });

  // Create a new subscription
  await gotoNewSubscription(page);
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
  // Monthly spend KPI should now be non-zero (exact: true avoids matching "$15.99/mo" in renewal list)
  await expect(page.getByText("$15.99", { exact: true })).toBeVisible({
    timeout: 10_000,
  });
});

// ─── B2: Phase 3 dashboard E2E tests ─────────────────────────────────────────

test("dashboard shows 6 KPI cards", async ({ page }) => {
  await signUpNewUser(page);

  await page.goto("/dashboard");
  // Wait for KPIs to render
  await expect(page.getByText("Monthly spend", { exact: true })).toBeVisible({
    timeout: 10_000,
  });

  await expect(page.getByText("Yearly spend", { exact: true })).toBeVisible();
  await expect(page.getByText("Cost per day", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Active subscriptions", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Upcoming renewals", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Remaining this month", { exact: true }),
  ).toBeVisible();
});

test("dashboard shows charts upgrade card for free users", async ({ page }) => {
  await signUpNewUser(page);

  await page.goto("/dashboard");
  // Free users see the upgrade card, not the charts
  await expect(page.getByText(/spending analytics/i)).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByRole("link", { name: /view plans/i })).toBeVisible();
});

test("dashboard shows renewal calendar", async ({ page }) => {
  await signUpNewUser(page);

  await page.goto("/dashboard");
  // "Upcoming renewals" appears as both a KPI title and a calendar card header
  await expect(
    page.getByText("Upcoming renewals", { exact: true }).first(),
  ).toBeVisible({ timeout: 10_000 });

  // Fresh user has no upcoming renewals — show empty-state text
  await expect(page.getByText("No renewals in the next 30 days")).toBeVisible();
});

test("dashboard shows spending insights", async ({ page }) => {
  await signUpNewUser(page);

  await page.goto("/dashboard");
  // Tips card header
  await expect(
    page.getByText("Spending insights", { exact: true }),
  ).toBeVisible({
    timeout: 10_000,
  });

  // Fresh user has no subscriptions — empty state
  await expect(page.getByTestId("tips-empty")).toBeVisible();
  await expect(
    page.getByText(
      "No insights yet — add more subscriptions to get personalized tips.",
    ),
  ).toBeVisible();
});

test("dashboard shows upgrade prompt (charts locked) after adding subscription as free user", async ({
  page,
}) => {
  await signUpNewUser(page);

  // Free user: charts section shows upgrade prompt regardless of subscription count
  await page.goto("/dashboard");
  await expect(page.getByText(/spending analytics/i)).toBeVisible({
    timeout: 10_000,
  });

  // Add a subscription
  await gotoNewSubscription(page);
  await page.getByLabel("Name *").fill(`Chart Sub ${uniqueSuffix()}`);
  await page.getByLabel("Price *").fill("9.99");
  await pickFutureDate(
    page,
    page.getByRole("button", { name: /Next renewal/i }),
  );
  await page.getByRole("button", { name: "Add subscription" }).click();
  await page.waitForURL(/\/subscriptions$/);

  // Return to dashboard — charts upgrade prompt still shown for free user
  await page.goto("/dashboard");
  await expect(page.getByText(/spending analytics/i)).toBeVisible({
    timeout: 10_000,
  });
});
