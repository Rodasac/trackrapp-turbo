import { test, expect } from "@playwright/test";
import { UNAUTHENTICATED_STORAGE_STATE } from "./fixtures/consent";

// Landing page tests run as unauthenticated visitors (consent cookie pre-set to unblock the UI)
test.use({ storageState: UNAUTHENTICATED_STORAGE_STATE });

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
  // Scope to the #features section to avoid h3 elements from other new sections
  const featuresSection = page.locator("#features");
  const cards = featuresSection.getByRole("heading", { level: 3 });
  await expect(cards).toHaveCount(6);
});

test("pricing section shows Free and Pro plans", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#pricing").getByText("Free", { exact: true })).toBeVisible();
  await expect(page.getByText("Pro", { exact: true }).first()).toBeVisible();
});

test("'See pricing' CTA links to #pricing anchor", async ({ page }) => {
  await page.goto("/");
  const seePricingLink = page
    .getByRole("link", { name: /see pricing/i })
    .first();
  await expect(seePricingLink).toBeVisible();
  await expect(seePricingLink).toHaveAttribute("href", "#pricing");
});

test("'Get started' navigates to /signup", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /get started/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/signup/);
});

test("'Sign in' link navigates to /login", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /sign in/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/login/);
});

test("How it works section shows 3 steps", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#how-it-works");
  await expect(
    section.getByRole("heading", { name: /how it works/i }),
  ).toBeVisible();
  await expect(section.getByText("Add your subscriptions")).toBeVisible();
  await expect(section.getByText("Get smart reminders")).toBeVisible();
  await expect(section.getByText("Save money")).toBeVisible();
});

test("FAQ accordion is present with questions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/is there a free plan/i)).toBeVisible();
  await expect(page.getByText(/can I cancel anytime/i)).toBeVisible();
});

test("CTA banner links to /signup", async ({ page }) => {
  await page.goto("/");
  // The CtaBanner has a "Start free" link
  const ctaLinks = page.getByRole("link", { name: /start free/i });
  // Multiple "Start free" links exist (hero + cta banner) — both should link to /signup
  await expect(ctaLinks.first()).toHaveAttribute("href", "/signup");
});

test("footer has Terms of Service link", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /terms of service/i }),
  ).toBeVisible();
});

test("footer has Privacy Policy link", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /privacy policy/i }),
  ).toBeVisible();
});
