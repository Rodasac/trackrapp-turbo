import { test, expect } from "@playwright/test";
import { uniqueSuffix } from "./fixtures/auth";

// All tests use authenticated storageState (default)

test("category dropdown shows seeded system categories", async ({ page }) => {
  await page.goto("/subscriptions/new");

  // Wait for categories to load
  await page.waitForLoadState("networkidle");

  // Open the category select
  const categoryTrigger = page
    .getByRole("combobox")
    .filter({ hasText: /no category/i });
  await categoryTrigger.click();

  // System categories from seed should be present
  // Use .first() because seed may have run multiple times creating duplicates
  await expect(page.getByRole("option", { name: "No category" })).toBeVisible();
  await expect(
    page.getByRole("option", { name: /entertainment/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("option", { name: /music/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("option", { name: /productivity/i }).first(),
  ).toBeVisible();

  // Close the dropdown
  await page.keyboard.press("Escape");
});

test("create new category appears in dropdown", async ({ page }) => {
  const catName = `Test Cat ${uniqueSuffix()}`;

  await page.goto("/subscriptions/new");
  await page.waitForLoadState("networkidle");

  // Open the AddCategoryDialog
  await page.getByRole("button", { name: "New category" }).click();

  // Fill in the category form — scope to dialog to avoid ambiguity with the
  // subscription form's "Name *" field and the icon's "emoji or name" label
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name", { exact: true }).first().fill(catName);
  await dialog.getByLabel("Color (hex)").fill("#6366f1");
  await dialog.getByLabel(/icon/i).fill("🎯");

  // Submit
  await page.getByRole("button", { name: "Create" }).click();

  // Toast should appear
  await expect(
    page.locator("[data-sonner-toast]").filter({ hasText: "Category created" }),
  ).toBeVisible();

  // After creation, the form's categoryId is set but the Select trigger may not
  // update until the categories query refetches and renders the matching item.
  // Open the dropdown and verify the new option is present, then select it so
  // the trigger text updates reliably.
  const categoryCombobox = page.getByRole("combobox", { name: "Category" });
  await categoryCombobox.click();
  await expect(
    page.getByRole("option", { name: catName }),
  ).toBeVisible({ timeout: 10_000 });
  await page.getByRole("option", { name: catName }).click();

  // Trigger should now show the category name
  await expect(categoryCombobox).toContainText(catName);
});

test("category creation requires name", async ({ page }) => {
  await page.goto("/subscriptions/new");

  await page.getByRole("button", { name: "New category" }).click();

  // Submit without filling name
  await page.getByRole("button", { name: "Create" }).click();

  await expect(
    page.getByRole("dialog").getByText("Name is required"),
  ).toBeVisible();
});

test("cancel category dialog does not create category", async ({ page }) => {
  const catName = `Would Not Create ${uniqueSuffix()}`;

  await page.goto("/subscriptions/new");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "New category" }).click();

  // Scope to dialog to avoid ambiguity
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name", { exact: true }).first().fill(catName);

  // Cancel
  await page.getByRole("button", { name: "Cancel" }).click();

  // Open category select and verify the name is NOT there
  const categoryTrigger = page
    .getByRole("combobox")
    .filter({ hasText: /no category/i });
  await categoryTrigger.click();

  await expect(
    page.getByRole("option", { name: catName }),
  ).not.toBeVisible();

  await page.keyboard.press("Escape");
});
