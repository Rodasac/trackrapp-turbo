import { test, expect } from "@playwright/test";

test.describe("Settings > Preferences tab", () => {
  test("shows Preferences tab with auto-renew toggle", async ({ page }) => {
    await page.goto("/settings?tab=preferences");

    // CardTitle renders as a <div>, not an <h3>, so use getByText
    await expect(page.getByText("Subscription preferences")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Auto-renew subscriptions")).toBeVisible();
    await expect(page.getByRole("switch")).toBeVisible();
  });

  test("toggle auto-renew preference saves", async ({ page }) => {
    await page.goto("/settings?tab=preferences");

    // Wait for preferences to load (skeleton disappears, switch becomes interactive)
    await expect(page.getByRole("switch")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("switch").click();

    await expect(
      page
        .locator("[data-sonner-toast]")
        .filter({ hasText: "Preference saved" }),
    ).toBeVisible({ timeout: 8_000 });
  });
});
