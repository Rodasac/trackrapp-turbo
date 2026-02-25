import type { Page, Locator } from "@playwright/test";

/**
 * Pick a future date in the shadcn Calendar popover.
 *
 * Strategy: always navigate to next month and pick day 15 — this guarantees
 * the chosen date is always in the future regardless of when the test runs.
 *
 * @param page  - Playwright Page
 * @param trigger - The "Pick a date" button locator that opens the calendar popover
 */
export async function pickFutureDate(
  page: Page,
  trigger: Locator,
): Promise<void> {
  await trigger.click();

  // Wait for the calendar to open
  const calendar = page.getByRole("grid");
  await calendar.waitFor({ state: "visible" });

  // Navigate to next month to ensure the date is in the future
  // react-day-picker v9 uses "Go to the Next Month" as the aria-label
  const nextMonthBtn = page.getByRole("button", { name: /go to the next month/i });
  await nextMonthBtn.click();

  // Pick day 15 (always exists in every month)
  await page.getByRole("gridcell", { name: "15" }).first().click();

  // Calendar should close after selection
  await calendar.waitFor({ state: "hidden" });
}
