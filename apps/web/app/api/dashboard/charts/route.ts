import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { toMonthlyRate } from "@repo/shared/billing";
import { toDateString } from "@repo/shared/dates";
import { eq, inArray } from "drizzle-orm";
import type {
  SpendingTrendPoint,
  CategoryBreakdownItem,
  TopSubscriptionItem,
} from "@/lib/types/api";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  // Fetch all subs (active + recently deactivated) for the user
  const subs = await db
    .select()
    .from(schema.trackedSubscriptions)
    .where(eq(schema.trackedSubscriptions.userId, session.user.id));

  if (subs.length === 0) {
    return Response.json({
      spendingTrend: [],
      categoryBreakdown: [],
      topSubscriptions: [],
    });
  }

  const subIds = subs.map((s) => s.id);

  // Fetch all price history for these subs
  const allPriceHistory = await db
    .select()
    .from(schema.priceHistory)
    .where(inArray(schema.priceHistory.trackedSubscriptionId, subIds));

  // Group price history by sub id, sorted ascending by recordedAt
  const priceHistoryBySub = new Map<
    number,
    { price: string; recordedAt: Date }[]
  >();
  for (const ph of allPriceHistory) {
    const list = priceHistoryBySub.get(ph.trackedSubscriptionId) ?? [];
    list.push({ price: ph.price, recordedAt: new Date(ph.recordedAt) });
    priceHistoryBySub.set(ph.trackedSubscriptionId, list);
  }
  for (const list of priceHistoryBySub.values()) {
    list.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
  }

  // ── Spending Trend: last 12 months ──────────────────────────────────────
  const now = new Date();
  const spendingTrend: SpendingTrendPoint[] = [];

  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthEndStr = toDateString(monthEnd);

    let monthTotal = 0;
    for (const sub of subs) {
      const startDate = sub.startDate ?? toDateString(sub.createdAt);
      // Sub was active during this month if it started before monthEnd
      // and was either still active OR deactivated after monthStart
      const wasActive =
        startDate <= monthEndStr &&
        (sub.isActive ||
          (sub.deactivatedAt != null &&
            sub.deactivatedAt >= monthStart));

      if (!wasActive) continue;

      // Find effective price at monthEnd: last price history entry before/at monthEnd
      const history = priceHistoryBySub.get(sub.id) ?? [];
      let effectivePrice = parseFloat(sub.price);
      if (history.length > 0) {
        // Find the last entry recorded at or before monthEnd
        const relevant = history.filter(
          (h) => h.recordedAt <= monthEnd,
        );
        if (relevant.length > 0) {
          effectivePrice = parseFloat(relevant[relevant.length - 1]!.price);
        }
      }

      monthTotal += toMonthlyRate(effectivePrice, sub.billingCycle);
    }

    const label = monthStart.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    spendingTrend.push({ month: label, total: parseFloat(monthTotal.toFixed(2)) });
  }

  // ── Category Breakdown (active subs only) ────────────────────────────────
  const activeSubs = subs.filter((s) => s.isActive);
  const categoryIds = [...new Set(activeSubs.map((s) => s.categoryId).filter((id): id is number => id != null))];

  const categories =
    categoryIds.length > 0
      ? await db
          .select()
          .from(schema.categories)
          .where(inArray(schema.categories.id, categoryIds))
      : [];

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const categoryTotals = new Map<string, { total: number; color: string }>();

  for (const sub of activeSubs) {
    const monthlyRate = toMonthlyRate(parseFloat(sub.price), sub.billingCycle);
    const cat = sub.categoryId != null ? catMap.get(sub.categoryId) : null;
    const name = cat?.name ?? "Uncategorized";
    const color = cat?.color ?? "#94a3b8";
    const existing = categoryTotals.get(name) ?? { total: 0, color };
    categoryTotals.set(name, { total: existing.total + monthlyRate, color: existing.color });
  }

  const categoryBreakdown: CategoryBreakdownItem[] = [...categoryTotals.entries()]
    .map(([name, { total, color }]) => ({
      name,
      total: parseFloat(total.toFixed(2)),
      color,
    }))
    .sort((a, b) => b.total - a.total);

  // ── Top 5 Subscriptions (active, by monthly rate) ────────────────────────
  const topSubscriptions: TopSubscriptionItem[] = activeSubs
    .map((sub) => ({
      name: sub.name,
      monthlyRate: parseFloat(
        toMonthlyRate(parseFloat(sub.price), sub.billingCycle).toFixed(2),
      ),
      billingCycle: sub.billingCycle,
    }))
    .sort((a, b) => b.monthlyRate - a.monthlyRate)
    .slice(0, 5);

  return Response.json({ spendingTrend, categoryBreakdown, topSubscriptions });
}
