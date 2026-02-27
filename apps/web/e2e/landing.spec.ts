import { test, expect } from "@playwright/test";

// Override storage state — landing page tests run as unauthenticated visitors
test.use({ storageState: { cookies: [], origins: [] } });

test("landing page loads with hero visible", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /track every subscription/i }),
  ).toBeVisible();
});

test("navbar shows Sign in and Get started for unauthenticated users", async ({
  page,
}) => {
  await page.goto("/");
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: /sign in/i })).toBeVisible();
  await expect(
    header.getByRole("link", { name: /get started/i }),
  ).toBeVisible();
});

test("feature cards section has 6 cards", async ({ page }) => {
  await page.goto("/");
  // Each card has an h3 heading
  const cards = page.getByRole("heading", { level: 3 });
  await expect(cards).toHaveCount(6);
});

test("pricing section shows Free and Pro plans", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Free", { exact: true })).toBeVisible();
  await expect(page.getByText("Pro", { exact: true }).first()).toBeVisible();
});

test("'See pricing' CTA links to #pricing anchor", async ({ page }) => {
  await page.goto("/");
  const seePricingLink = page.getByRole("link", { name: /see pricing/i });
  await expect(seePricingLink).toBeVisible();
  await expect(seePricingLink).toHaveAttribute("href", "#pricing");
});

test("'Get started' navigates to /signup", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /get started/i }).first().click();
  await expect(page).toHaveURL(/\/signup/);
});

test("'Sign in' link navigates to /login", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /sign in/i }).first().click();
  await expect(page).toHaveURL(/\/login/);
});
