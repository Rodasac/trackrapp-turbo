import { toMonthlyRate } from "@repo/shared/billing";
import type { SubscriptionListItem } from "@/lib/types/api";
import type { StaticTip } from "@/lib/types/api";

/**
 * Generate actionable tips from the user's active subscriptions.
 * Pure function — no side effects, fully testable.
 */
export function generateStaticTips(subs: SubscriptionListItem[]): StaticTip[] {
  if (subs.length === 0) return [];

  const tips: StaticTip[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]!;

  const totalMonthly = subs.reduce(
    (sum, s) => sum + toMonthlyRate(parseFloat(s.price), s.billingCycle),
    0,
  );

  // 1. Annual savings: any monthly sub could save by switching to annual (17%)
  const monthlySubs = subs.filter((s) => s.billingCycle === "monthly");
  if (monthlySubs.length > 0) {
    const potentialSavings = monthlySubs.reduce(
      (sum, s) => sum + parseFloat(s.price) * 12 * 0.17,
      0,
    );
    if (potentialSavings >= 10) {
      tips.push({
        id: "annual-savings",
        title: "Switch to annual billing",
        message: `Switching your ${monthlySubs.length} monthly subscription${monthlySubs.length > 1 ? "s" : ""} to annual could save you ~$${potentialSavings.toFixed(0)}/year (est. 17% discount).`,
        type: "savings",
      });
    }
  }

  // 2. High-spend category: any category > 40% of total spend
  if (subs.length >= 2) {
    const categoryTotals = new Map<string, number>();
    for (const sub of subs) {
      const catName = sub.category?.name ?? "Uncategorized";
      const rate = toMonthlyRate(parseFloat(sub.price), sub.billingCycle);
      categoryTotals.set(catName, (categoryTotals.get(catName) ?? 0) + rate);
    }
    for (const [catName, catTotal] of categoryTotals.entries()) {
      if (catTotal / totalMonthly > 0.4) {
        tips.push({
          id: `high-spend-${catName.toLowerCase().replace(/\s+/g, "-")}`,
          title: `High ${catName} spend`,
          message: `${catName} accounts for ${Math.round((catTotal / totalMonthly) * 100)}% of your monthly spend ($${catTotal.toFixed(2)}/mo). Consider reviewing these subscriptions.`,
          type: "warning",
        });
        break; // Only flag the top one
      }
    }
  }

  // 3. Forgotten subscription: nextRenewalDate > 60 days past today (overdue)
  const forgotten = subs.filter((s) => {
    if (!s.nextRenewalDate) return false;
    const daysPast =
      (today.getTime() - new Date(s.nextRenewalDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return daysPast > 60;
  });
  if (forgotten.length > 0) {
    tips.push({
      id: "forgotten-subscriptions",
      title: "Possibly forgotten subscriptions",
      message: `${forgotten.length} subscription${forgotten.length > 1 ? "s are" : " is"} more than 60 days past their renewal date. You may have cancelled ${forgotten.length > 1 ? "them" : "it"} without updating TrackrApp.`,
      type: "warning",
    });
  }

  // 4. Daily cost awareness
  if (totalMonthly > 0) {
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate();
    const dailyCost = totalMonthly / daysInMonth;
    tips.push({
      id: "daily-cost",
      title: "Your subscription cost per day",
      message: `You spend $${dailyCost.toFixed(2)}/day across all ${subs.length} subscription${subs.length !== 1 ? "s" : ""} — that's $${(dailyCost * 7).toFixed(2)}/week.`,
      type: "info",
    });
  }

  // 5. Overlapping services: 2+ subs in same category
  const categoryCounts = new Map<string, number>();
  for (const sub of subs) {
    if (!sub.category) continue;
    categoryCounts.set(
      sub.category.name,
      (categoryCounts.get(sub.category.name) ?? 0) + 1,
    );
  }
  const overlapping = [...categoryCounts.entries()].filter(
    ([, count]) => count >= 2,
  );
  if (overlapping.length > 0) {
    const [catName, count] = overlapping[0]!;
    tips.push({
      id: `overlap-${catName.toLowerCase().replace(/\s+/g, "-")}`,
      title: "Potential overlap detected",
      message: `You have ${count} subscriptions in the "${catName}" category. These might offer overlapping features — consider whether you need all of them.`,
      type: "info",
    });
  }

  // Suppress unused variable warning for todayStr
  void todayStr;

  return tips;
}
