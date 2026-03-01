import { parseDateString, toDateString } from "./dates";

/**
 * Advance a "YYYY-MM-DD" date by one billing cycle.
 * Clamps to month-end when the target month is shorter than the source day.
 */
export function computeNextRenewalDate(
  currentDate: string,
  billingCycle: string,
): string {
  const d = parseDateString(currentDate);

  if (billingCycle === "weekly") {
    d.setDate(d.getDate() + 7);
    return toDateString(d);
  }

  const monthsToAdd =
    billingCycle === "monthly"
      ? 1
      : billingCycle === "quarterly"
        ? 3
        : billingCycle === "yearly"
          ? 12
          : 1; // fallback: monthly

  const originalDay = d.getDate();
  // Move to the 1st to avoid overflow when advancing months
  d.setDate(1);
  d.setMonth(d.getMonth() + monthsToAdd);
  // Clamp to the last day of the new month if needed
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, daysInMonth));
  return toDateString(d);
}

/**
 * Returns true when nextRenewalDate is today or in the past.
 */
export function isDue(nextRenewalDate: string): boolean {
  const renewal = parseDateString(nextRenewalDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return renewal <= today;
}

/**
 * Normalize any billing cycle to a monthly equivalent cost.
 * Uses exact calendar fractions: 52 weeks / 12 months = 4.333…
 */
export function toMonthlyRate(price: number, billingCycle: string): number {
  switch (billingCycle) {
    case "monthly":
      return price;
    case "yearly":
      return price / 12;
    case "quarterly":
      return price / 3;
    case "weekly":
      return (price * 52) / 12;
    default:
      return price;
  }
}
