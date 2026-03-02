import { test, expect } from "@playwright/test";

// Fresh browser — no storage state, no cookies
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Cookie consent banner", () => {
  test("shows banner overlay on first visit", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("dialog", { name: /cookie consent/i }),
    ).toBeVisible();
  });

  test("dismisses banner after Accept all and does not reappear on reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /accept all cookies/i }).click();

    // Banner should be gone
    await expect(
      page.getByRole("dialog", { name: /cookie consent/i }),
    ).toHaveCount(0);

    // Reload and confirm it stays dismissed
    await page.reload();
    await expect(
      page.getByRole("dialog", { name: /cookie consent/i }),
    ).toHaveCount(0);
  });
});
