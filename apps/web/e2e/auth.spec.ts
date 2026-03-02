import { test, expect } from "@playwright/test";
import {
  signUpNewUser,
  loginUser,
  signOut,
  uniqueSuffix,
} from "./fixtures/auth";
import { UNAUTHENTICATED_STORAGE_STATE } from "./fixtures/consent";

// All tests in this file run unauthenticated (consent cookie pre-set to unblock the UI)
test.use({ storageState: UNAUTHENTICATED_STORAGE_STATE });

test("landing page shows CTA buttons", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /track every subscription/i }),
  ).toBeVisible();
  const header = page.locator("header");
  await expect(
    header.getByRole("link", { name: /get started/i }),
  ).toBeVisible();
  await expect(header.getByRole("link", { name: /sign in/i })).toBeVisible();
});

test("signup redirects to check-email page (email verification required)", async ({
  page,
}) => {
  const id = uniqueSuffix();
  const email = `e2e-${id}@test.local`;
  await page.goto("/signup");
  await page.getByLabel("Name").fill(`E2E User ${id}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Create account" }).click();
  // Email verification required: redirects to /check-email
  await page.waitForURL("**/check-email**");
  await expect(page).toHaveURL(/\/check-email/);
  await expect(
    page.getByText("Check your email", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
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
  // Sign out so we can reach /signup as an unauthenticated user
  await signOut(page);
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
  // Sign out so we can test the login flow from an unauthenticated state
  await signOut(page);
  await loginUser(page, creds.email, creds.password);
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("login with wrong password shows error toast", async ({ page }) => {
  const creds = await signUpNewUser(page);
  // Sign out so /login is reachable (proxy redirects authenticated users away)
  await signOut(page);
  await page.goto("/login");
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill("WrongPassword!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("[data-sonner-toast]")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("login shows validation errors for empty fields", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(page.getByText("Password is required")).toBeVisible();
});

test("protected route /dashboard redirects to /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?callbackUrl/);
});

test("protected route /subscriptions redirects to /login", async ({ page }) => {
  await page.goto("/subscriptions");
  await expect(page).toHaveURL(/\/login/);
});

test("logout redirects to login page", async ({ page }) => {
  await signUpNewUser(page);
  // Already at /dashboard after signup (Better Auth auto-logs in)
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

test("login page shows forgot password link", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("link", { name: /forgot password/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /forgot password/i }),
  ).toHaveAttribute("href", "/forgot-password");
});

test("login page shows Google sign-in button", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: /sign in with google/i }),
  ).toBeVisible();
});

test("signup page shows Google sign-up button", async ({ page }) => {
  await page.goto("/signup");
  await expect(
    page.getByRole("button", { name: /sign up with google/i }),
  ).toBeVisible();
});
