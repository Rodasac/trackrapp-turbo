import { test, expect } from "@playwright/test";
import { signUpNewUser, uniqueSuffix } from "./fixtures/auth";
import { UNAUTHENTICATED_STORAGE_STATE } from "./fixtures/consent";

// All tests in this file run unauthenticated (consent cookie pre-set to unblock the UI)
test.use({ storageState: UNAUTHENTICATED_STORAGE_STATE });

test("signup shows check-email page with correct email", async ({ page }) => {
  const id = uniqueSuffix();
  const email = `e2e-${id}@test.local`;

  await page.goto("/signup");
  await page.getByLabel("Name").fill(`E2E User ${id}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();

  await page.waitForURL("**/check-email**");
  await expect(
    page.getByText("Check your email", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
});

test("check-email page shows resend email button", async ({ page }) => {
  const id = uniqueSuffix();
  const email = `e2e-${id}@test.local`;

  await page.goto("/signup");
  await page.getByLabel("Name").fill(`E2E User ${id}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();

  await page.waitForURL("**/check-email**");
  await expect(
    page.getByRole("button", { name: /resend email/i }),
  ).toBeVisible();
});

test("check-email page has back to sign in link", async ({ page }) => {
  const id = uniqueSuffix();

  await page.goto("/signup");
  await page.getByLabel("Name").fill(`E2E User ${id}`);
  await page.getByLabel("Email").fill(`e2e-${id}@test.local`);
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();

  await page.waitForURL("**/check-email**");
  await expect(
    page.getByRole("link", { name: /back to sign in/i }),
  ).toBeVisible();
});

test("signup flow: verify email via dev endpoint then login succeeds", async ({
  page,
}) => {
  // signUpNewUser handles: signup → check-email → dev-verify → login → dashboard
  await signUpNewUser(page);
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("login without verifying shows unverified email message", async ({
  page,
}) => {
  const id = uniqueSuffix();
  const email = `e2e-${id}@test.local`;
  const password = "Password123!";

  // Sign up without verifying
  await page.goto("/signup");
  await page.getByLabel("Name").fill(`E2E User ${id}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/check-email**");

  // Try to login without verifying
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  // Should show the unverified email banner
  await expect(page.getByText(/please verify your email first/i)).toBeVisible({
    timeout: 10_000,
  });
  await expect(
    page.getByRole("button", { name: /resend verification email/i }),
  ).toBeVisible();
});
