import { test, expect } from "@playwright/test";
import { signUpNewUser } from "./fixtures/auth";

// Override storageState for this entire file — every test here creates a brand-
// new user so they start with a completely empty account.
test.use({ storageState: { cookies: [], origins: [] } });

test("subscriptions empty state shows placeholder text", async ({ page }) => {
  await signUpNewUser(page);
  await page.goto("/subscriptions");
  await expect(page.getByText("No subscriptions yet")).toBeVisible();
});
