import { toMonthlyRate } from "@repo/shared/billing";
import type { SubscriptionListItem } from "@/lib/types/api";
import type { StaticTip } from "@/lib/types/api";

export interface TipMessages {
  annualSavingsTitle: string;
  annualSavingsMessage: (params: { count: number; savings: string }) => string;
  highSpendTitle: (params: { catName: string }) => string;
  highSpendMessage: (params: {
    catName: string;
    pct: number;
    amount: string;
  }) => string;
  forgottenTitle: string;
  forgottenMessage: (params: { count: number }) => string;
  dailyCostTitle: string;
  dailyCostMessage: (params: {
    daily: string;
    count: number;
    weekly: string;
  }) => string;
  overlapTitle: string;
  overlapMessage: (params: { count: number; catName: string }) => string;
}

const DEFAULT_TIP_MESSAGES: TipMessages = {
  annualSavingsTitle: "Switch to annual billing",
  annualSavingsMessage: ({ count, savings }) =>
    `Switching your ${count} monthly subscription${count > 1 ? "s" : ""} to annual could save you ~$${savings}/year (est. 17% discount).`,
  highSpendTitle: ({ catName }) => `High ${catName} spend`,
  highSpendMessage: ({ catName, pct, amount }) =>
    `${catName} accounts for ${pct}% of your monthly spend ($${amount}/mo). Consider reviewing these subscriptions.`,
  forgottenTitle: "Possibly forgotten subscriptions",
  forgottenMessage: ({ count }) =>
    `${count} subscription${count > 1 ? "s are" : " is"} more than 60 days past their renewal date. You may have cancelled ${count > 1 ? "them" : "it"} without updating TrackrApp.`,
  dailyCostTitle: "Your subscription cost per day",
  dailyCostMessage: ({ daily, count, weekly }) =>
    `You spend $${daily}/day across all ${count} subscription${count !== 1 ? "s" : ""} — that's $${weekly}/week.`,
  overlapTitle: "Potential overlap detected",
  overlapMessage: ({ count, catName }) =>
    `You have ${count} subscriptions in the "${catName}" category. These might offer overlapping features — consider whether you need all of them.`,
};

/**
 * Generate actionable tips from the user's active subscriptions.
 * Pure function — no side effects, fully testable.
 */
export function generateStaticTips(
  subs: SubscriptionListItem[],
  messages: TipMessages = DEFAULT_TIP_MESSAGES,
): StaticTip[] {
  const msg = messages;
  if (subs.length === 0) return [];

  const tips: StaticTip[] = [];
  const today = new Date();

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
        title: msg.annualSavingsTitle,
        message: msg.annualSavingsMessage({
          count: monthlySubs.length,
          savings: potentialSavings.toFixed(0),
        }),
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
          title: msg.highSpendTitle({ catName }),
          message: msg.highSpendMessage({
            catName,
            pct: Math.round((catTotal / totalMonthly) * 100),
            amount: catTotal.toFixed(2),
          }),
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
      title: msg.forgottenTitle,
      message: msg.forgottenMessage({ count: forgotten.length }),
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
      title: msg.dailyCostTitle,
      message: msg.dailyCostMessage({
        daily: dailyCost.toFixed(2),
        count: subs.length,
        weekly: (dailyCost * 7).toFixed(2),
      }),
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
      title: msg.overlapTitle,
      message: msg.overlapMessage({ count, catName }),
      type: "info",
    });
  }

  return tips;
}
