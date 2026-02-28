import { test, expect } from "@playwright/test";

// All tests use the default authenticated storageState (set in playwright.config.ts).

test("theme toggle button is visible in sidebar", async ({ page }) => {
  await page.goto("/dashboard");
  // The toggle is a button inside the logo row with sr-only "Toggle theme" text
  await expect(
    page.getByRole("button", { name: "Toggle theme" }),
  ).toBeVisible();
});

test("selecting Dark adds .dark class to <html>", async ({ page }) => {
  await page.goto("/dashboard");

  // Open the dropdown
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();

  // <html> should now have the .dark class
  const htmlClass = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  expect(htmlClass).toBe(true);
});

test("selecting Light removes .dark class from <html>", async ({ page }) => {
  await page.goto("/dashboard");

  // First set dark
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();

  // Then set light
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitem", { name: "Light" }).click();

  const htmlClass = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  expect(htmlClass).toBe(false);
});

test("dark mode changes background color", async ({ page }) => {
  await page.goto("/dashboard");

  // Get light background
  const lightBg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );

  // Switch to dark
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();

  const darkBg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );

  // Background should have changed
  expect(darkBg).not.toBe(lightBg);
});

test("theme preference persists after page reload", async ({ page }) => {
  await page.goto("/dashboard");

  // Set dark mode
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();

  // Reload
  await page.reload();

  // .dark class should still be on <html> after reload (next-themes restores from localStorage)
  const htmlClass = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  expect(htmlClass).toBe(true);

  // Clean up: reset to system so other tests are unaffected
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitem", { name: "System" }).click();
});
