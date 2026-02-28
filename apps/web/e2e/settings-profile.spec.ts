import { test, expect } from "@playwright/test";
import { signUpNewUser } from "./fixtures/auth";

// Each test creates a fresh user
test.use({ storageState: { cookies: [], origins: [] } });

test("settings profile tab shows user name pre-populated", async ({ page }) => {
  const { name } = await signUpNewUser(page);

  await page.goto("/settings");

  // Profile tab is default — wait for the form to load
  await expect(page.getByLabel("Name")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByLabel("Name")).toHaveValue(name);
});

test("settings profile tab shows avatar initials when no image", async ({
  page,
}) => {
  const { name } = await signUpNewUser(page);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0]?.toUpperCase() ?? "")
    .join("");

  await page.goto("/settings");

  await expect(page.getByText(initials)).toBeVisible({ timeout: 10_000 });
});

test("settings profile tab shows Change photo button", async ({ page }) => {
  await signUpNewUser(page);

  await page.goto("/settings");

  await expect(
    page.getByRole("button", { name: /change photo/i }),
  ).toBeVisible({ timeout: 10_000 });
});

test("updating name saves and shows success toast", async ({ page }) => {
  await signUpNewUser(page);

  await page.goto("/settings");
  await expect(page.getByLabel("Name")).toBeVisible({ timeout: 10_000 });

  await page.getByLabel("Name").fill("Updated Name");
  await page.getByRole("button", { name: /save changes/i }).click();

  await expect(page.getByText(/profile saved/i)).toBeVisible({
    timeout: 10_000,
  });
});

test("email/password user sees change password section", async ({ page }) => {
  await signUpNewUser(page);

  await page.goto("/settings");

  await expect(page.getByText(/change password/i)).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByLabel(/current password/i)).toBeVisible();
});

test("change password shows error for wrong current password", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/settings");
  await expect(page.getByLabel(/current password/i)).toBeVisible({
    timeout: 10_000,
  });

  await page.getByLabel(/current password/i).fill("WrongPass1!");
  await page.getByLabel("New password").fill("NewPass456@");
  await page.getByLabel(/confirm new password/i).fill("NewPass456@");
  await page.getByRole("button", { name: /change password/i }).click();

  // Better Auth returns an error for wrong current password
  await expect(page.getByText(/incorrect|invalid|wrong|failed/i)).toBeVisible({
    timeout: 10_000,
  });
});

test("change password succeeds with valid current password", async ({
  page,
}) => {
  const { password } = await signUpNewUser(page);

  await page.goto("/settings");
  await expect(page.getByLabel(/current password/i)).toBeVisible({
    timeout: 10_000,
  });

  await page.getByLabel(/current password/i).fill(password);
  await page.getByLabel("New password").fill("NewPass456@");
  await page.getByLabel(/confirm new password/i).fill("NewPass456@");
  await page.getByRole("button", { name: /change password/i }).click();

  await expect(page.getByText(/password changed/i)).toBeVisible({
    timeout: 10_000,
  });
});

test("clicking Notifications tab switches to notifications view", async ({
  page,
}) => {
  await signUpNewUser(page);

  await page.goto("/settings");
  await page.getByRole("tab", { name: /notifications/i }).click();

  await expect(
    page.getByText(/choose how and when you receive/i),
  ).toBeVisible({ timeout: 10_000 });
});
