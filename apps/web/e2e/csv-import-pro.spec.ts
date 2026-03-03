/**
 * CSV import E2E tests for Pro users.
 *
 * Uses grantProPlan() at the start to elevate the test user to Pro,
 * then verifies that the full CSV import flow works.
 */
import { test, expect } from "@playwright/test";
import { signUpNewUser, grantProPlan, uniqueSuffix } from "./fixtures/auth";

test.use({ storageState: { cookies: [], origins: [] } });

test("CSV import button is visible for Pro users on subscriptions page", async ({
  page,
}) => {
  const { email } = await signUpNewUser(page);
  await grantProPlan(page, email);

  // Reload to pick up the new Pro subscription
  await page.reload();
  await page.goto("/subscriptions");
  await expect(page.getByRole("link", { name: /import csv/i })).toBeVisible({
    timeout: 10_000,
  });
});

test("/subscriptions/import shows import UI for Pro users", async ({
  page,
}) => {
  const { email } = await signUpNewUser(page);
  await grantProPlan(page, email);

  await page.goto("/subscriptions/import");
  // Pro users see the upload UI, not the gate
  await expect(page.getByText(/drag & drop/i)).toBeVisible({ timeout: 10_000 });
});

test("Full CSV import flow works for Pro users", async ({ page }) => {
  const { email } = await signUpNewUser(page);
  await grantProPlan(page, email);

  const subName = `E2E Pro Import ${uniqueSuffix()}`;
  const csv = [
    "Name,Price,Currency,Billing Cycle,Next Renewal,Category,Start Date,Status",
    `${subName},9.99,USD,monthly,2026-12-01,Entertainment,2026-01-01,active`,
  ].join("\n");

  await page.goto("/subscriptions/import");

  // Step 1: Upload
  await page.getByTestId("csv-file-input").setInputFiles({
    name: "subscriptions.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf-8"),
  });

  // Step 2: Mapping — auto-detected
  await expect(page.getByText(/map your csv columns/i)).toBeVisible({
    timeout: 5_000,
  });
  const previewPromise = page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions/import/preview") &&
      r.status() === 200,
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: /continue to preview/i }).click();
  await previewPromise;

  // Step 3: Preview — row is shown
  await expect(page.getByText(subName)).toBeVisible({ timeout: 10_000 });

  // Step 4: Import
  await page.getByRole("checkbox", { name: /select all/i }).check();
  await page.getByRole("button", { name: /import \d+ selected/i }).click();

  await page.waitForResponse(
    (r) =>
      r.url().includes("/api/subscriptions/import") &&
      !r.url().includes("preview") &&
      r.status() === 200,
    { timeout: 15_000 },
  );

  // Redirect to subscriptions list
  await page.waitForURL(/\/subscriptions$/, { timeout: 10_000 });

  // Verify the imported subscription appears
  await page.waitForResponse(
    (r) => r.url().includes("/api/subscriptions") && r.status() === 200,
    { timeout: 10_000 },
  );
  await page.getByPlaceholder(/search subscriptions/i).fill(subName);
  await expect(page.getByRole("row").filter({ hasText: subName })).toBeVisible({
    timeout: 10_000,
  });
});
