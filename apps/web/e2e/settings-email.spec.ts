import { test, expect } from "@playwright/test";
import { signUpNewUser } from "./fixtures/auth";

// Each test creates a fresh user
test.use({ storageState: { cookies: [], origins: [] } });

test("settings profile shows current email", async ({ page }) => {
  const { email } = await signUpNewUser(page);

  await page.goto("/settings");
  // Scope to main to avoid matching the sidebar email display (strict mode)
  await expect(page.locator("main").getByText(email)).toBeVisible({
    timeout: 10_000,
  });
});

test("settings profile shows Change email button for credential user", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/settings");
  await expect(
    page.getByRole("button", { name: /change email/i }),
  ).toBeVisible({ timeout: 10_000 });
});

test("clicking Change email reveals the change email form", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/settings");
  await expect(
    page.getByRole("button", { name: /change email/i }),
  ).toBeVisible({ timeout: 10_000 });

  // Change email form should not be visible yet
  await expect(
    page.getByLabel(/new email address/i),
  ).not.toBeVisible();

  await page.getByRole("button", { name: /change email/i }).click();

  // After clicking, the form should be visible
  await expect(page.getByLabel(/new email address/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /send verification email/i }),
  ).toBeVisible();
});

test("submitting change email form with valid email shows success message", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/settings");
  await expect(
    page.getByRole("button", { name: /change email/i }),
  ).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: /change email/i }).click();
  await page.getByLabel(/new email address/i).fill("changed@example.com");
  await page.getByRole("button", { name: /send verification email/i }).click();

  await expect(
    page.getByText(/verification email sent to/i),
  ).toBeVisible({ timeout: 10_000 });
});

test("submitting change email form with invalid email shows validation error", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/settings");
  await expect(
    page.getByRole("button", { name: /change email/i }),
  ).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: /change email/i }).click();
  await page.getByLabel(/new email address/i).fill("not-valid");
  await page.getByRole("button", { name: /send verification email/i }).click();

  await expect(
    page.getByText(/enter a valid email address/i),
  ).toBeVisible({ timeout: 5_000 });
});
