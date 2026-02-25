import { test as setup, expect } from "@playwright/test";
import { signUpNewUser, loginUser, saveTestUser } from "./fixtures/auth";

const AUTH_FILE = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Sign up a fresh user for this test session
  const creds = await signUpNewUser(page);

  // Login and confirm redirect to dashboard
  await loginUser(page, creds.email, creds.password);
  await expect(page).toHaveURL(/\/dashboard/);

  // Save credentials so auth specs can re-login if needed
  saveTestUser(creds);

  // Persist the authenticated browser state (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });
});
