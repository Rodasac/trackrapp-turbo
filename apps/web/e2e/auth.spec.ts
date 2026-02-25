import { test, expect } from "@playwright/test";
import { signUpNewUser, loginUser, uniqueSuffix } from "./fixtures/auth";

// All tests in this file run unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test("landing page shows CTA buttons", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "TrackrApp" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});

test("signup creates account and redirects to login", async ({ page }) => {
  const id = uniqueSuffix();
  await page.goto("/signup");
  await page.getByLabel("Name").fill(`E2E User ${id}`);
  await page.getByLabel("Email").fill(`e2e-${id}@test.local`);
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/login**");
  await expect(page).toHaveURL(/\/login/);
});

test("signup shows validation errors for empty fields", async ({ page }) => {
  await page.goto("/signup");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByText("Name must be at least 2 characters"),
  ).toBeVisible();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(
    page.getByText("Password must be at least 8 characters"),
  ).toBeVisible();
});

test("signup shows error for duplicate email", async ({ page }) => {
  const creds = await signUpNewUser(page);
  // Try signing up again with the same email
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Another User");
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();
  // Should stay on signup page and show an error toast
  await expect(page.locator("[data-sonner-toast]")).toBeVisible();
  await expect(page).toHaveURL(/\/signup/);
});

test("login with valid credentials redirects to dashboard", async ({
  page,
}) => {
  const creds = await signUpNewUser(page);
  await loginUser(page, creds.email, creds.password);
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "Dashboard" }),
  ).toBeVisible();
});

test("login with wrong password shows error toast", async ({ page }) => {
  const creds = await signUpNewUser(page);
  await page.goto("/login");
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill("WrongPassword!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("[data-sonner-toast]")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("login shows validation errors for empty fields", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(page.getByText("Password is required")).toBeVisible();
});

test("protected route /dashboard redirects to /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?callbackUrl/);
});

test("protected route /subscriptions redirects to /login", async ({
  page,
}) => {
  await page.goto("/subscriptions");
  await expect(page).toHaveURL(/\/login/);
});

test("logout redirects to login page", async ({ page }) => {
  const creds = await signUpNewUser(page);
  await loginUser(page, creds.email, creds.password);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("login and signup pages have cross-links", async ({ page }) => {
  // Login page links to signup
  await page.goto("/login");
  await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();

  // Signup page links to login
  await page.goto("/signup");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});
