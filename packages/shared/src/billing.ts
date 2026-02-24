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
