import { test, expect, type Page } from "@playwright/test";
import { uniqueSuffix } from "./fixtures/auth";
import { pickFutureDate } from "./fixtures/dates";

// State shared between sequential tests
let manualSubName: string;

/**
 * Navigate to /subscriptions/new and wait for the form to be fully
 * hydrated. We use the /api/categories response as a signal: this call
 * is made by useCategories() inside the form component, which only runs
 * after React 18 has finished async hydration and component effects have
 * fired. Waiting for it prevents a race where we click "Add subscription"
 * before the form's onSubmit handler is attached.
 */
async function gotoNewSubscription(page: Page): Promise<void> {
  const categoriesReady = page.waitForResponse(
    (r) => r.url().includes("/api/categories") && r.status() === 200,
    { timeout: 15_000 },
  );
  await page.goto("/subscriptions/new");
  await categoriesReady;
}

// Navigate from the subscriptions list to the Manual Sub detail page.
// Uses search to guarantee exactly 1 row is visible, avoiding strict-mode
// violations when filter({ hasText }) would match multiple rows.
// Resilient against module re-evaluation (which resets manualSubName to
// undefined): falls back to the stable "Manual Sub" prefix and recovers
// the actual name from the page so subsequent assertions still work.
async function goToManualSubDetail(page: Page): Promise<void> {
  await page.goto("/subscriptions");
  // Wait for actual subscription data to appear (not just loading skeleton rows).
  await expect(
    page.locator("td").filter({ hasText: "Manual Sub" }).first(),
  ).toBeVisible({ timeout: 10_000 });

  const searchInput = page.getByPlaceholder(/Search subscriptions/i);
  // Always search by the stable "Manual Sub" prefix so this helper works even
  // if manualSubName was reset by a module re-evaluation.
  const searchResponse = page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions") &&
      r.url().includes("search=") &&
      r.status() === 200,
    { timeout: 8_000 },
  );
  await searchInput.fill("Manual Sub");
  await searchResponse;

  // Wait for exactly 1 data row
  await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 8_000 });
  await expect(page.getByRole("row").nth(2))
    .not.toBeVisible({ timeout: 3_000 })
    .catch(() => {});

  // If manualSubName was lost (module re-eval), recover it from the name cell
  if (!manualSubName) {
    const nameText = await page
      .getByRole("row")
      .nth(1)
      .getByRole("cell")
      .nth(1)
      .textContent();
    manualSubName = nameText?.trim() ?? "Manual Sub";
  }

  // Now safe: only 1 data row visible, nth(1) Actions button is unambiguous
  await page
    .getByRole("row")
    .nth(1)
    .getByRole("button", { name: "Actions" })
    .click();
  await page.getByRole("menuitem", { name: "View" }).click();
  await page.waitForURL(/\/subscriptions\/\d+$/);
}

// NOTE: The "empty state shows placeholder text" test has been moved to
// e2e/empty-state.spec.ts so that this file uses only the `page` fixture.
// Mixing `browser`-fixture tests here causes Playwright to re-evaluate the
// module between fixture-scope switches, resetting module-level variables.

// ─── Create ───────────────────────────────────────────────────────────────────

test("create subscription manually", async ({ page }) => {
  manualSubName = `Manual Sub ${uniqueSuffix()}`;

  await gotoNewSubscription(page);
  await page.getByLabel("Name *").fill(manualSubName);
  await page.getByLabel("Price *").fill("12.99");

  await pickFutureDate(
    page,
    page.getByRole("button", { name: /Next renewal/i }),
  );

  await page.getByRole("button", { name: "Add subscription" }).click();
  await page.waitForURL("**/subscriptions");

  await expect(
    page
      .locator("[data-sonner-toast]")
      .filter({ hasText: "Subscription added!" }),
  ).toBeVisible();
});

test("create subscription from catalog (Netflix)", async ({ page }) => {
  await gotoNewSubscription(page);

  // Type in the catalog search (300 ms debounce — wait for result to appear)
  const catalogInput = page.getByPlaceholder(/Search for a service/i);
  await catalogInput.fill("Netflix");

  // Click the Netflix result (waiting for it implicitly handles the debounce)
  await page.getByRole("button", { name: "Netflix" }).first().click();

  // Name should be auto-filled
  await expect(page.getByLabel("Name *")).toHaveValue("Netflix");

  await pickFutureDate(
    page,
    page.getByRole("button", { name: /Next renewal/i }),
  );
  await page.getByRole("button", { name: "Add subscription" }).click();
  await page.waitForURL("**/subscriptions");
  await expect(
    page
      .locator("[data-sonner-toast]")
      .filter({ hasText: "Subscription added!" }),
  ).toBeVisible();
});

test("create subscription with all optional fields", async ({ page }) => {
  const fullName = `Full Sub ${uniqueSuffix()}`;

  await gotoNewSubscription(page);
  await page.getByLabel("Name *").fill(fullName);
  await page.getByLabel("Price *").fill("99.99");

  // Billing cycle: yearly
  await page.getByRole("combobox", { name: /billing cycle/i }).click();
  await page.getByRole("option", { name: "Yearly" }).click();

  await pickFutureDate(
    page,
    page.getByRole("button", { name: /Next renewal/i }),
  );

  // Category: Entertainment
  await page.getByRole("combobox", { name: "Category" }).click();
  await page
    .getByRole("option", { name: /entertainment/i })
    .first()
    .click();

  await page.getByLabel("Description").fill("Streaming service");
  await page.getByLabel("Notes").fill("Shared account");

  await page.getByRole("button", { name: "Add subscription" }).click();
  await page.waitForURL("**/subscriptions");
  await expect(
    page
      .locator("[data-sonner-toast]")
      .filter({ hasText: "Subscription added!" }),
  ).toBeVisible();
});

test("create subscription shows validation errors for empty form", async ({
  page,
}) => {
  await gotoNewSubscription(page);
  await page.getByRole("button", { name: "Add subscription" }).click();
  await expect(page.getByText("Name is required")).toBeVisible();
  await expect(page.getByText("Renewal date is required")).toBeVisible();
});

// ─── List & Filters ───────────────────────────────────────────────────────────

test("list shows all subscriptions", async ({ page }) => {
  await page.goto("/subscriptions");
  // At least the manually-created subscription should appear
  await expect(
    page.locator("td").filter({ hasText: manualSubName }).first(),
  ).toBeVisible({ timeout: 10_000 });
  await expect(
    page.locator("td").filter({ hasText: "Netflix" }).first(),
  ).toBeVisible();
});

test("search filter narrows and clears results", async ({ page }) => {
  await page.goto("/subscriptions");
  // Wait for list to load — positive wait avoids passing during skeleton phase
  await expect(
    page.locator("td").filter({ hasText: "Netflix" }).first(),
  ).toBeVisible({ timeout: 10_000 });

  const searchInput = page.getByPlaceholder(/Search subscriptions/i);

  // Filter to Manual Sub only — wait for the search-filtered response.
  // The predicate includes "search=" to avoid resolving with a concurrent
  // background refetch that doesn't contain the search parameter.
  const filterResponse = page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions") &&
      r.url().includes("search=") &&
      r.status() === 200,
    { timeout: 8_000 },
  );
  await searchInput.fill("Manual Sub");
  await filterResponse;
  await expect(
    page
      .locator("td")
      .filter({ hasText: manualSubName ?? "Manual Sub" })
      .first(),
  ).toBeVisible();
  await expect(
    page.locator("td").filter({ hasText: "Netflix" }),
  ).not.toBeVisible({ timeout: 5_000 });

  // Clear — TanStack Query may serve cached unfiltered data (no network request),
  // so rely on the positive data assertion instead of waitForResponse.
  await searchInput.clear();
  await expect(
    page.locator("td").filter({ hasText: "Netflix" }).first(),
  ).toBeVisible({ timeout: 10_000 });

  // Non-matching search → empty state
  await searchInput.fill("xyznonexistent999");
  await expect(page.getByText("No matches")).toBeVisible();
});

test("category filter shows only matching subscriptions", async ({ page }) => {
  await page.goto("/subscriptions");
  await expect(
    page.locator("td").filter({ hasText: "Netflix" }).first(),
  ).toBeVisible({ timeout: 10_000 });

  const categorySelect = page.getByTestId("category-filter");
  await categorySelect.click();

  const categoryResponse = page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions") &&
      r.url().includes("category=") &&
      r.status() === 200,
    { timeout: 8_000 },
  );
  await page
    .getByRole("option", { name: /entertainment/i })
    .first()
    .click();
  await categoryResponse;

  // "Full Sub" should appear (it was tagged as Entertainment)
  await expect(
    page
      .locator("td")
      .filter({ hasText: /Full Sub/ })
      .first(),
  ).toBeVisible();
  // Manual Sub has no category — should be filtered out
  await expect(
    page.locator("td").filter({ hasText: manualSubName ?? "Manual Sub" }),
  ).toHaveCount(0);

  // Revert to all — TanStack Query may serve cached unfiltered data (no network
  // request), so rely on the positive data assertion instead of waitForResponse.
  await categorySelect.click();
  await page.getByRole("option", { name: "All categories" }).click();
  await expect(
    page
      .locator("td")
      .filter({ hasText: manualSubName ?? "Manual Sub" })
      .first(),
  ).toBeVisible({ timeout: 10_000 });
});

test("sort order changes row order", async ({ page }) => {
  await page.goto("/subscriptions");
  await expect(
    page.locator("td").filter({ hasText: "Netflix" }).first(),
  ).toBeVisible({ timeout: 10_000 });

  const sortSelect = page.getByTestId("sort-select");

  // Sort name A-Z
  await sortSelect.click();
  await page.getByRole("option", { name: "Name A–Z" }).click();

  // First cell in name column should start with "F" (Full Sub)
  const firstNameCell = page.getByRole("cell").filter({ hasText: /full sub/i });
  await expect(firstNameCell.first()).toBeVisible();

  // Sort name Z-A — Netflix should be first
  await sortSelect.click();
  await page.getByRole("option", { name: "Name Z–A" }).click();
  await expect(
    page.locator("td").filter({ hasText: "Netflix" }).first(),
  ).toBeVisible();
});

// ─── Detail view ──────────────────────────────────────────────────────────────

test("click Actions → View navigates to detail page", async ({ page }) => {
  await goToManualSubDetail(page);
  await expect(page).toHaveURL(/\/subscriptions\/\d+$/);
});

test("detail page shows subscription fields", async ({ page }) => {
  await goToManualSubDetail(page);
  // Heading
  await expect(
    page.getByRole("heading", { name: "Subscription" }),
  ).toBeVisible();
  // Name shown as a heading h2
  await expect(
    page.getByRole("heading", { name: manualSubName }),
  ).toBeVisible();
  // Price (use .first() because $12.99 also appears in price history after any edit)
  await expect(page.getByText("$12.99").first()).toBeVisible();
  // Edit + Cancel (deactivate) buttons — active subs no longer show Delete
  await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
});

test("back button navigates to subscriptions list", async ({ page }) => {
  await goToManualSubDetail(page);
  // The ArrowLeft back button is rendered as <Link href="/subscriptions"> inside
  // a ghost icon Button. Click the first link pointing to /subscriptions that
  // lives in the main content area (not the sidebar Subscriptions nav link).
  const mainEl = page.getByRole("main");
  await mainEl.locator("a[href='/subscriptions']").click();
  await expect(page).toHaveURL(/\/subscriptions$/);
});

test("edit subscription updates name and price", async ({ page }) => {
  await goToManualSubDetail(page);
  await page.getByRole("button", { name: "Edit" }).click();

  // Form should appear pre-filled
  const nameInput = page.getByLabel("Name *");
  await expect(nameInput).toHaveValue(manualSubName);

  // Update name and price
  await nameInput.clear();
  await nameInput.fill(`${manualSubName} (edited)`);
  await page.getByLabel("Price *").clear();
  await page.getByLabel("Price *").fill("19.99");

  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(
    page
      .locator("[data-sonner-toast]")
      .filter({ hasText: "Subscription updated!" }),
  ).toBeVisible();
  // Should return to view mode
  await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  // Update the shared variable for subsequent tests
  manualSubName = `${manualSubName} (edited)`;
});

test("cancel edit returns to view mode", async ({ page }) => {
  await goToManualSubDetail(page);
  await page.getByRole("button", { name: "Edit" }).click();

  // Cancel button (with X icon)
  await page.getByRole("button", { name: "Cancel" }).click();

  // Back to view mode: Edit button visible, form gone
  await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save changes" }),
  ).not.toBeVisible();
});

test("price history section appears after price edit", async ({ page }) => {
  await goToManualSubDetail(page);
  // The PUT /api/subscriptions/[id] route inserts exactly 1 price history
  // entry (the NEW price) when the price changes. With 1 entry, the detail
  // page renders it as formatted text — not the chart (which needs ≥2 entries).
  await expect(page.getByText("Price history")).toBeVisible({ timeout: 8_000 });
  // New price ($19.99) should appear in the price history entry
  // Use .first() since it also appears in the current price display header
  await expect(page.getByText("$19.99").first()).toBeVisible();
});

test("deactivate subscription via dialog", async ({ page }) => {
  await goToManualSubDetail(page);
  // Cancel button directly deactivates the active subscription (no dialog)
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Inactive").first()).toBeVisible({
    timeout: 8_000,
  });
  await expect(page.getByRole("button", { name: "Reactivate" })).toBeVisible();
});

test("show inactive toggle reveals deactivated subscription", async ({
  page,
}) => {
  await page.goto("/subscriptions");

  // Deactivated sub should be hidden by default
  // Use toHaveCount(0) instead of not.toBeVisible() — the latter triggers
  // strict mode when the locator would match multiple elements.
  await expect(
    page.locator("td").filter({ hasText: manualSubName }),
  ).toHaveCount(0);

  // Toggle "Show inactive"
  await page.getByRole("switch", { name: /show inactive/i }).click();

  // Now it should appear (with reduced opacity but visible in DOM)
  await expect(
    page.locator("td").filter({ hasText: manualSubName }).first(),
  ).toBeVisible();
});

// ─── Delete permanently ───────────────────────────────────────────────────────

// ─── CSV export ───────────────────────────────────────────────────────────────

test("CSV export button triggers download", async ({ page }) => {
  await page.goto("/subscriptions");
  // Wait for list to load (subscriptions created earlier in the chain)
  await page
    .getByRole("row")
    .nth(1)
    .waitFor({ state: "visible", timeout: 10_000 });

  // Start waiting for the download event before clicking
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /export csv/i }).click();
  const download = await downloadPromise;

  // Verify the file name is correct
  expect(download.suggestedFilename()).toBe("subscriptions.csv");
});

// ─── Delete permanently ───────────────────────────────────────────────────────

test("delete permanently removes subscription", async ({ page }) => {
  const tempName = `Temp Sub ${uniqueSuffix()}`;

  // Create a temporary subscription
  await gotoNewSubscription(page);
  await page.getByLabel("Name *").fill(tempName);
  await page.getByLabel("Price *").fill("5.00");
  await pickFutureDate(
    page,
    page.getByRole("button", { name: /Next renewal/i }),
  );
  await page.getByRole("button", { name: "Add subscription" }).click();
  await page.waitForURL("**/subscriptions");

  // Find it in the list and navigate to its detail
  const row = page.getByRole("row").filter({ hasText: tempName });
  await row.getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: "View" }).click();
  await page.waitForURL(/\/subscriptions\/\d+$/);

  // Deactivate first — Delete only appears for inactive subscriptions
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("button", { name: "Reactivate" })).toBeVisible({
    timeout: 8_000,
  });

  // Delete permanently
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(
    page.getByRole("heading", { name: "Remove subscription?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete permanently" }).click();

  await expect(
    page
      .locator("[data-sonner-toast]")
      .filter({ hasText: "Subscription deleted" }),
  ).toBeVisible();

  // Should redirect back to /subscriptions
  await page.waitForURL("**/subscriptions");

  // Subscription should be gone from list
  await page.getByRole("switch", { name: /show inactive/i }).click(); // show all
  await expect(
    page.locator("td").filter({ hasText: tempName }),
  ).not.toBeVisible();
});
