import { test, expect, type Page } from "@playwright/test";
import { uniqueSuffix } from "./fixtures/auth";

/**
 * Create a subscription with a past renewal date via the API so it is
 * immediately "due" without navigating through the form UI.
 */
async function createDueSubscription(
  page: Page,
): Promise<{ id: number; name: string }> {
  const name = `Due Sub ${uniqueSuffix()}`;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const pastDate = yesterday.toISOString().slice(0, 10);

  const res = await page.request.post("/api/subscriptions", {
    data: JSON.stringify({
      name,
      price: "10.00",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: pastDate,
    }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok()) {
    throw new Error(
      `createDueSubscription failed: ${res.status()} ${await res.text()}`,
    );
  }
  const sub = (await res.json()) as { id: number };
  if (!sub.id) throw new Error(`createDueSubscription: no id in response`);
  return { id: sub.id, name };
}

/**
 * Fill the search input and wait for the filtered API response before
 * asserting results — prevents assertions on stale TanStack Query cache.
 */
async function searchForSub(page: Page, name: string): Promise<void> {
  const searchResponse = page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions") &&
      r.url().includes("search=") &&
      r.status() === 200,
    { timeout: 8_000 },
  );
  await page.getByPlaceholder(/Search subscriptions/i).fill(name);
  await searchResponse;
}

// All tests are sequential and share state within the describe block.
// Using serial mode ensures state variables persist even if a test fails.
test.describe.configure({ mode: "serial" });

test.describe("Quick actions — due subscription lifecycle", () => {
  // State shared between all tests in this block
  let dueSubId = 0;
  let dueSubName = "";

  // ─── Setup ──────────────────────────────────────────────────────────────────

  test("due subscription shows Due badge in list", async ({ page }) => {
    const result = await createDueSubscription(page);
    dueSubId = result.id;
    dueSubName = result.name;

    await page.goto("/subscriptions");
    await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 10_000 });
    await searchForSub(page, dueSubName);

    const row = page.getByRole("row").filter({ hasText: dueSubName });
    // exact: true prevents matching "Due Sub ..." subscription name as well
    await expect(row.getByText("Due", { exact: true })).toBeVisible();
  });

  // ─── Detail page quick actions ────────────────────────────────────────────

  test("due subscription shows Renew button in detail", async ({ page }) => {
    await page.goto(`/subscriptions/${dueSubId}`);

    // exact: true prevents "Undo Renewal" from partially matching "Renew"
    await expect(
      page.getByRole("button", { name: "Renew", exact: true }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Due", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Undo Renewal" }),
    ).toHaveCount(0);
  });

  test("renew advances date and shows Undo Renewal", async ({ page }) => {
    await page.goto(`/subscriptions/${dueSubId}`);
    await expect(
      page.getByRole("button", { name: "Renew", exact: true }),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Renew", exact: true }).click();

    await expect(
      page.getByRole("button", { name: "Undo Renewal" }),
    ).toBeVisible({ timeout: 8_000 });
    await expect(
      page.getByRole("button", { name: "Renew", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByText("Due", { exact: true })).toHaveCount(0);
  });

  test("undo renewal reverts date", async ({ page }) => {
    await page.goto(`/subscriptions/${dueSubId}`);
    await expect(
      page.getByRole("button", { name: "Undo Renewal" }),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Undo Renewal" }).click();

    await expect(
      page.getByRole("button", { name: "Renew", exact: true }),
    ).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText("Due", { exact: true })).toBeVisible();
  });

  test("cancel deactivates subscription from detail", async ({ page }) => {
    await page.goto(`/subscriptions/${dueSubId}`);
    // Confirm we're viewing an active due subscription
    await expect(
      page.getByRole("button", { name: "Renew", exact: true }),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByText("Inactive").first()).toBeVisible({
      timeout: 8_000,
    });
    await expect(
      page.getByRole("button", { name: "Reactivate" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toHaveCount(0);
  });

  test("reactivate restores subscription from detail", async ({ page }) => {
    await page.goto(`/subscriptions/${dueSubId}`);
    await expect(
      page.getByRole("button", { name: "Reactivate" }),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Reactivate" }).click();

    await expect(
      page.getByRole("button", { name: "Cancel" }),
    ).toBeVisible({ timeout: 8_000 });
    await expect(
      page.getByRole("button", { name: "Reactivate" }),
    ).toHaveCount(0);
  });

  // ─── List dropdown quick actions ────────────────────────────────────────────

  test("renew from list dropdown shows toast", async ({ page }) => {
    // After reactivation the sub is still due: nextRenewalDate is unchanged
    // (the PATCH /reactivate endpoint only flips isActive, not the date).
    await page.goto("/subscriptions");
    await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 10_000 });
    await searchForSub(page, dueSubName);

    const row = page.getByRole("row").filter({ hasText: dueSubName });
    await row.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Renew", exact: true }).click();

    await expect(
      page.locator("[data-sonner-toast]").filter({ hasText: "Renewed" }),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("undo renewal from list dropdown shows toast", async ({ page }) => {
    // After renewing from the list, previousRenewalDate is set → "Undo renewal" appears
    await page.goto("/subscriptions");
    await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 10_000 });
    await searchForSub(page, dueSubName);

    const row = page.getByRole("row").filter({ hasText: dueSubName });
    await row.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Undo renewal" }).click();

    await expect(
      page.locator("[data-sonner-toast]").filter({ hasText: "Renewal undone" }),
    ).toBeVisible({ timeout: 8_000 });
  });
});
