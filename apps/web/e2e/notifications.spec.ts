import { test, expect } from "@playwright/test";

// All tests in this file use the standard authenticated page fixture
// with the shared auth storage state (set by playwright.config.ts).

test.describe("Notification preferences (Settings → Notifications tab)", () => {
  test("shows notification preferences form with default values", async ({
    page,
  }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Notifications" }).click();

    // Wait for the form to load (preferences are fetched from API)
    await expect(
      page.getByRole("button", { name: /save preferences/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Default: email enabled, push disabled
    const switches = page.getByRole("switch");
    await expect(switches.first()).toHaveAttribute("aria-checked", "true");
    await expect(switches.nth(1)).toHaveAttribute("aria-checked", "false");

    // Default reminder days: 7, 3, 1 should be selected
    // We look for the pills — they are buttons with specific text
    await expect(page.getByRole("button", { name: "7 days" })).toBeVisible();
    await expect(page.getByRole("button", { name: "3 days" })).toBeVisible();
    await expect(page.getByRole("button", { name: "1 day" })).toBeVisible();
  });

  test("can toggle email off and save, then reload and see persisted state", async ({
    page,
  }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Notifications" }).click();
    await expect(
      page.getByRole("button", { name: /save preferences/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Turn email off
    const emailSwitch = page.getByRole("switch").first();
    await emailSwitch.click();
    await expect(emailSwitch).toHaveAttribute("aria-checked", "false");

    // Save
    await page.getByRole("button", { name: /save preferences/i }).click();
    await expect(page.getByText("Notification preferences saved")).toBeVisible({
      timeout: 5_000,
    });

    // Reload and verify persisted
    await page.reload();
    await page.getByRole("tab", { name: "Notifications" }).click();
    await expect(
      page.getByRole("button", { name: /save preferences/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("switch").first()).toHaveAttribute(
      "aria-checked",
      "false",
    );

    // Restore for other tests
    await page.getByRole("switch").first().click();
    await page.getByRole("button", { name: /save preferences/i }).click();
  });

  test("can add a reminder day and save", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("tab", { name: "Notifications" }).click();
    await expect(
      page.getByRole("button", { name: /save preferences/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Click "14 days" to add it
    await page.getByRole("button", { name: "14 days" }).click();
    await page.getByRole("button", { name: /save preferences/i }).click();
    await expect(page.getByText("Notification preferences saved")).toBeVisible({
      timeout: 5_000,
    });

    // Reload and verify 14 days is persisted
    await page.reload();
    await page.getByRole("tab", { name: "Notifications" }).click();
    await expect(
      page.getByRole("button", { name: /save preferences/i }),
    ).toBeVisible({ timeout: 10_000 });

    // The "14 days" pill should now be highlighted (bg-brand class)
    const pill14 = page.getByRole("button", { name: "14 days" });
    await expect(pill14).toHaveClass(/bg-brand/);

    // Clean up: deselect 14 days
    await pill14.click();
    await page.getByRole("button", { name: /save preferences/i }).click();
  });
});

test.describe("Notification center (/notifications)", () => {
  test("shows empty state when no notifications exist", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page.getByText("All caught up")).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText("Renewal reminders will appear here."),
    ).toBeVisible();
  });

  test("shows page title and description", async ({ page }) => {
    await page.goto("/notifications");
    await expect(
      page.getByRole("heading", { name: "Notifications" }),
    ).toBeVisible();
    await expect(
      page.getByText("Renewal reminders and system alerts"),
    ).toBeVisible();
  });

  test("does not show 'mark all as read' button when no notifications", async ({
    page,
  }) => {
    await page.goto("/notifications");
    // Wait for page to fully load
    await expect(page.getByText("All caught up")).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole("button", { name: /mark all as read/i }),
    ).not.toBeVisible();
  });

  test("navigates from sidebar Notifications link", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /notifications/i }).click();
    await expect(page).toHaveURL(/\/notifications/);
    await expect(
      page.getByRole("heading", { name: "Notifications" }),
    ).toBeVisible();
  });

  test("notification bell in sidebar shows no badge when no unread", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    // The sidebar bell should not show a badge (no notifications seeded)
    // We check that there's no badge element next to the bell icon
    const notifLink = page.getByRole("link", { name: /notifications/i });
    await expect(notifLink).toBeVisible();
    // Badge only appears if count > 0 — we expect it absent
    expect(await notifLink.locator("span > span").count()).toBe(0);
  });
});
