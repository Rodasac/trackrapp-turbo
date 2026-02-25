import { test, expect, type Page } from "@playwright/test";
import { pickFutureDate } from "./fixtures/dates";
import { signUpNewUser, loginUser, uniqueSuffix } from "./fixtures/auth";

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
  const { email, password } = await signUpNewUser(page);
  await loginUser(page, email, password);

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // Wait for stats to load (they start as "—" then resolve)
  await expect(page.getByText("$0.00").first()).toBeVisible({ timeout: 10_000 });

  // All spend KPIs should show $0.00
  const kpiValues = page.locator(".text-2xl, .text-3xl").filter({ hasText: "$0.00" });
  await expect(kpiValues.first()).toBeVisible();

  // Active subscriptions = 0
  await expect(page.getByText("Active subscriptions", { exact: true })).toBeVisible();
});

test("dashboard shows chart placeholder", async ({ page }) => {
  const { email, password } = await signUpNewUser(page);
  await loginUser(page, email, password);

  await page.goto("/dashboard");
  await expect(
    page.getByText(
      "Charts and insights will appear here once you add subscriptions.",
    ),
  ).toBeVisible();
});

test("KPIs update after adding a subscription", async ({ page }) => {
  const { email, password } = await signUpNewUser(page);
  await loginUser(page, email, password);

  // Confirm zero state first
  await page.goto("/dashboard");
  await expect(page.getByText("$0.00").first()).toBeVisible({ timeout: 10_000 });

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
  // Monthly spend should now be non-zero
  await expect(page.getByText("$15.99")).toBeVisible({ timeout: 10_000 });
});
