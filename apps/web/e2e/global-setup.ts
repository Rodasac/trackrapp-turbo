import { test as setup, expect } from "@playwright/test";
import { signUpNewUser, saveTestUser } from "./fixtures/auth";

const AUTH_FILE = "e2e/.auth/user.json";

const CONSENT_COOKIE = {
  name: "trackr_cookie_consent",
  value: encodeURIComponent(
    JSON.stringify({
      necessary: true,
      functional: true,
      analytics: true,
      consentedAt: new Date().toISOString(),
    }),
  ),
  domain: "localhost",
  path: "/",
};

setup("authenticate", async ({ page }) => {
  // Pre-set consent cookie so the banner doesn't block any E2E flows
  await page.context().addCookies([CONSENT_COOKIE]);

  // Sign up a fresh user — Better Auth auto-logs in, ending at /dashboard
  const creds = await signUpNewUser(page);
  await expect(page).toHaveURL(/\/dashboard/);

  // Save credentials so auth specs can re-login if needed
  saveTestUser(creds);

  // Persist the authenticated browser state (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });
});
