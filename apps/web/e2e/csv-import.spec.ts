import { test, expect } from "@playwright/test";
import { uniqueSuffix } from "./fixtures/auth";

// Sequential tests — use module-level state to track the imported name
let importedSubName: string;

// ─── CSV content ──────────────────────────────────────────────────────────────
// Uses TrackrApp export format so column auto-detection fires
function makeTrackrCsv(subName: string): Buffer {
  const lines = [
    "Name,Price,Currency,Billing Cycle,Next Renewal,Category,Start Date,Status",
    `${subName},9.99,USD,monthly,2026-12-01,Entertainment,2026-01-01,active`,
  ].join("\n");
  return Buffer.from(lines, "utf-8");
}

// Minimal CSV — only Name and Price columns
function makeMinimalCsv(subName: string): Buffer {
  const lines = ["Name,Price", `${subName},4.99`].join("\n");
  return Buffer.from(lines, "utf-8");
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test("Import CSV button is visible on subscriptions page", async ({ page }) => {
  await page.goto("/subscriptions");
  await expect(page.getByRole("link", { name: /import csv/i })).toBeVisible();
});

test("Import CSV button navigates to import page", async ({ page }) => {
  await page.goto("/subscriptions");
  await page.getByRole("link", { name: /import csv/i }).click();
  await page.waitForURL(/\/subscriptions\/import$/);
  await expect(
    page.getByRole("heading", { name: /import subscriptions/i }),
  ).toBeVisible();
});

test("Step 1: Upload step renders and accepts a CSV file", async ({ page }) => {
  await page.goto("/subscriptions/import");

  // Verify the upload zone is present
  await expect(page.getByText(/drag & drop/i)).toBeVisible();

  importedSubName = `E2E Import ${uniqueSuffix()}`;
  const csvBuffer = makeTrackrCsv(importedSubName);

  // Upload the CSV
  const fileInput = page.getByTestId("csv-file-input");
  await fileInput.setInputFiles({
    name: "subscriptions.csv",
    mimeType: "text/csv",
    buffer: csvBuffer,
  });

  // Should auto-advance to step 2 (Map Columns)
  await expect(page.getByText(/map your csv columns/i)).toBeVisible({
    timeout: 5_000,
  });
});

test("Step 2: Mapping step auto-detects TrackrApp columns", async ({
  page,
}) => {
  await page.goto("/subscriptions/import");

  const csvBuffer = makeTrackrCsv(
    importedSubName ?? `E2E Import ${uniqueSuffix()}`,
  );
  const fileInput = page.getByTestId("csv-file-input");
  await fileInput.setInputFiles({
    name: "subscriptions.csv",
    mimeType: "text/csv",
    buffer: csvBuffer,
  });

  // Wait for mapping step
  await expect(page.getByText(/map your csv columns/i)).toBeVisible({
    timeout: 5_000,
  });

  // All 8 TrackrApp headers should be auto-detected
  await expect(page.getByText(/8 of/i)).toBeVisible();

  // Continue button should be enabled (all required fields mapped)
  await expect(
    page.getByRole("button", { name: /continue to preview/i }),
  ).toBeEnabled();
});

test("Step 3: Preview step shows rows with match badges", async ({ page }) => {
  await page.goto("/subscriptions/import");

  const csvBuffer = makeTrackrCsv(
    importedSubName ?? `E2E Import ${uniqueSuffix()}`,
  );
  const fileInput = page.getByTestId("csv-file-input");
  await fileInput.setInputFiles({
    name: "subscriptions.csv",
    mimeType: "text/csv",
    buffer: csvBuffer,
  });

  // Advance through mapping step; register listener before clicking Continue
  await expect(page.getByText(/map your csv columns/i)).toBeVisible({
    timeout: 5_000,
  });
  const previewResponse = page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions/import/preview") &&
      r.status() === 200,
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: /continue to preview/i }).click();
  await previewResponse;

  // Preview table should show the subscription row
  await expect(page.getByText(importedSubName ?? "E2E Import")).toBeVisible({
    timeout: 10_000,
  });

  // Should show a match confidence badge (Exact, Fuzzy, or None)
  const badges = page
    .locator("span")
    .filter({ hasText: /^(Exact|Fuzzy|None)$/ });
  await expect(badges.first()).toBeVisible({ timeout: 5_000 });
});

test("Minimal CSV: import with defaults (name+price only)", async ({
  page,
}) => {
  await page.goto("/subscriptions/import");

  const subName = `E2E Minimal ${uniqueSuffix()}`;
  const csvBuffer = makeMinimalCsv(subName);

  // Step 1: Upload 2-column CSV
  const fileInput = page.getByTestId("csv-file-input");
  await fileInput.setInputFiles({
    name: "minimal.csv",
    mimeType: "text/csv",
    buffer: csvBuffer,
  });

  // Step 2: Mapping step — only 2 columns detected
  await expect(page.getByText(/map your csv columns/i)).toBeVisible({
    timeout: 5_000,
  });
  await expect(page.getByText(/2 of/i)).toBeVisible();

  // Open the Default Values panel and set nextRenewalDate
  await page.getByText(/default values/i).click();
  const renewalInput = page.locator("#default-next-renewal-date");
  await renewalInput.fill("2026-12-01");

  // Continue should now be enabled (billingCycle=monthly from default, nextRenewalDate set)
  await expect(
    page.getByRole("button", { name: /continue to preview/i }),
  ).toBeEnabled();

  // Step 3: Proceed to preview
  const previewResponsePromise = page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions/import/preview") &&
      r.status() === 200,
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: /continue to preview/i }).click();
  await previewResponsePromise;

  // The subscription name should appear in the preview
  await expect(page.getByText(subName)).toBeVisible({ timeout: 10_000 });

  // Step 4: Select all and import
  const selectAll = page.getByRole("checkbox", { name: /select all/i });
  await selectAll.check();
  await page.getByRole("button", { name: /import \d+ selected/i }).click();

  // Wait for import to complete
  await page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions/import") &&
      !r.url().includes("preview") &&
      r.status() === 200,
    { timeout: 15_000 },
  );

  // Should redirect to subscriptions list
  await page.waitForURL(/\/subscriptions$/, { timeout: 10_000 });

  // New subscription should appear in the list
  await page.waitForResponse(
    (r) => r.url().includes("/api/subscriptions") && r.status() === 200,
    { timeout: 10_000 },
  );
  const searchInput = page.getByPlaceholder(/search subscriptions/i);
  await searchInput.fill(subName);
  await expect(page.getByRole("row").filter({ hasText: subName })).toBeVisible({
    timeout: 10_000,
  });
});

test("Full flow: upload → map → preview → confirm → redirect", async ({
  page,
}) => {
  await page.goto("/subscriptions/import");

  const subName = `E2E Full ${uniqueSuffix()}`;
  const csvBuffer = makeTrackrCsv(subName);

  // Step 1: Upload
  const fileInput = page.getByTestId("csv-file-input");
  await fileInput.setInputFiles({
    name: "subscriptions.csv",
    mimeType: "text/csv",
    buffer: csvBuffer,
  });

  // Step 2: Map — auto-detected; register listener before clicking Continue
  await expect(page.getByText(/map your csv columns/i)).toBeVisible({
    timeout: 5_000,
  });
  const previewResponsePromise = page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions/import/preview") &&
      r.status() === 200,
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: /continue to preview/i }).click();

  // Step 3: Wait for preview API
  await previewResponsePromise;
  await expect(page.getByText(subName)).toBeVisible({ timeout: 10_000 });

  // Select all valid rows via the select-all checkbox
  const selectAll = page.getByRole("checkbox", { name: /select all/i });
  await selectAll.check();

  // Click Import
  await page.getByRole("button", { name: /import \d+ selected/i }).click();

  // Wait for import API response
  await page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions/import") &&
      !r.url().includes("preview") &&
      r.status() === 200,
    { timeout: 15_000 },
  );

  // Should redirect back to /subscriptions
  await page.waitForURL(/\/subscriptions$/, { timeout: 10_000 });

  // New subscription should be visible in the list
  await page.waitForResponse(
    (r) => r.url().includes("/api/subscriptions") && r.status() === 200,
    { timeout: 10_000 },
  );
  const searchInput = page.getByPlaceholder(/search subscriptions/i);
  await searchInput.fill(subName);
  await expect(page.getByRole("row").filter({ hasText: subName })).toBeVisible({
    timeout: 10_000,
  });
});
