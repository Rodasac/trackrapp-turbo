import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { toMonthlyRate } from "@repo/shared/billing";
import { toDateString } from "@repo/shared/dates";
import { and, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const subs = await db
    .select()
    .from(schema.trackedSubscriptions)
    .where(
      and(
        eq(schema.trackedSubscriptions.userId, session.user.id),
        eq(schema.trackedSubscriptions.isActive, true),
      ),
    );

  const now = new Date();
  const todayStr = toDateString(now);
  const sevenDaysLaterStr = toDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const endOfMonthStr = toDateString(endOfMonth);
  const daysInMonth = endOfMonth.getDate();

  let monthlySpend = 0;
  let upcomingRenewals = 0;
  let remainingThisMonth = 0;

  for (const sub of subs) {
    monthlySpend += toMonthlyRate(parseFloat(sub.price), sub.billingCycle);
    if (
      sub.nextRenewalDate >= todayStr &&
      sub.nextRenewalDate <= sevenDaysLaterStr
    ) {
      upcomingRenewals++;
    }
    if (
      sub.nextRenewalDate >= todayStr &&
      sub.nextRenewalDate <= endOfMonthStr
    ) {
      remainingThisMonth += parseFloat(sub.price);
    }
  }

  return Response.json({
    monthlySpend: monthlySpend.toFixed(2),
    yearlySpend: (monthlySpend * 12).toFixed(2),
    activeCount: subs.length,
    upcomingRenewals,
    costPerDay: (monthlySpend / daysInMonth).toFixed(2),
    remainingThisMonth: remainingThisMonth.toFixed(2),
  });
}
