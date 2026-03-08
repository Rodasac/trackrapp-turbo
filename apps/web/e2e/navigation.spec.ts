import { test, expect } from "@playwright/test";
import { loadTestUser, signUpNewUser } from "./fixtures/auth";

// Most tests use the default authenticated storageState.

test("sidebar renders all navigation items", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /subscriptions/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /notifications/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /tips/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /settings/i })).toBeVisible();
});

test("Dashboard sidebar link navigates to /dashboard", async ({ page }) => {
  await page.goto("/subscriptions");
  await page.getByRole("link", { name: /^dashboard$/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("Subscriptions sidebar link navigates to /subscriptions", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await page.getByRole("link", { name: /^subscriptions$/i }).click();
  await expect(page).toHaveURL(/\/subscriptions/);
  await expect(
    page.getByRole("heading", { name: "Subscriptions" }),
  ).toBeVisible();
});

test("Notifications page shows 'All caught up' placeholder", async ({
  page,
}) => {
  await page.goto("/notifications");
  await expect(
    page.getByRole("heading", { name: "Notifications" }),
  ).toBeVisible();
  await expect(page.getByText("All caught up")).toBeVisible();
});

test("Tips page shows Pro badge and Upgrade button for free user", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await ctx.newPage();
  await signUpNewUser(page);
  await page.goto("/tips");
  await expect(
    page.getByRole("heading", { name: "AI Insights" }),
  ).toBeVisible();
  await expect(page.getByText("Pro").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Upgrade to Pro" }),
  ).toBeVisible();
  await ctx.close();
});

test("Settings page shows 3 tabs and Billing tab content", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  // Three tabs
  await expect(page.getByRole("tab", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Notifications" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Billing" })).toBeVisible();

  // Click Billing tab
  await page.getByRole("tab", { name: "Billing" }).click();
  // Billing card title is in a div, not a heading element
  await expect(
    page
      .getByRole("tabpanel", { name: "Billing" })
      .getByText("Billing", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Manage your subscription plan")).toBeVisible();
});

// Pricing is a public page — test it both unauthenticated and from the
// authenticated session (sidebar has no pricing link; navigate directly).
test("pricing page shows Free and Pro plan cards", async ({ page }) => {
  await page.goto("/pricing");
  await expect(
    page.getByRole("heading", { name: "Simple pricing" }),
  ).toBeVisible();

  // Free card — plan names are in div elements, not heading elements
  await expect(page.getByText("Free", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Get started free" }),
  ).toBeVisible();

  // Pro card — CTA may render as <button> or <a> depending on session timing
  await expect(page.getByText("Pro", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Start free trial")).toBeVisible();
});

test("sidebar displays the logged-in user's name and email", async ({
  page,
}) => {
  const user = loadTestUser();

  await page.goto("/dashboard");

  // User name and email shown in the sidebar footer
  await expect(page.getByText(user.name)).toBeVisible();
  await expect(page.getByText(user.email)).toBeVisible();
});
