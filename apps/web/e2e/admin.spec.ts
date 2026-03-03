/**
 * Admin E2E tests.
 *
 * Uses setUserRole() to grant admin role to test users.
 * Verifies access control and admin page functionality.
 */
import { test, expect } from "@playwright/test";
import { signUpNewUser, setUserRole } from "./fixtures/auth";

test.use({ storageState: { cookies: [], origins: [] } });

test("Admin link NOT visible in sidebar for regular users", async ({
  page,
}) => {
  await signUpNewUser(page);
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: /^admin$/i })).not.toBeVisible();
});

test("Admin link IS visible in sidebar for admin users", async ({ page }) => {
  const { email } = await signUpNewUser(page);
  await setUserRole(page, email, "admin");

  // Reload to pick up new role from session
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: /^admin$/i })).toBeVisible({
    timeout: 10_000,
  });
});

test("/admin shows 'Access Denied' for regular users", async ({ page }) => {
  await signUpNewUser(page);
  await page.goto("/admin");
  await expect(page.getByText(/access denied/i)).toBeVisible({
    timeout: 10_000,
  });
});

test("/admin renders stats and user table for admin users", async ({
  page,
}) => {
  const { email } = await signUpNewUser(page);
  await setUserRole(page, email, "admin");

  await page.goto("/admin");
  // Admin stats KPI cards
  await expect(page.getByText(/total users/i)).toBeVisible({ timeout: 10_000 });
  // User table
  await expect(page.getByPlaceholder(/search users by email/i)).toBeVisible();
});

test("Admin page user table shows current user's email", async ({ page }) => {
  const { email } = await signUpNewUser(page);
  await setUserRole(page, email, "admin");

  await page.goto("/admin");
  await expect(page.getByText(email)).toBeVisible({ timeout: 10_000 });
});
