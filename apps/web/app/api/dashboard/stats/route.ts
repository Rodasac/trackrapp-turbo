import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { toMonthlyRate } from "@repo/shared/billing";
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

  const todayStr = new Date().toISOString().split("T")[0]!;
  const sevenDaysLaterStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;

  let monthlySpend = 0;
  let upcomingRenewals = 0;

  for (const sub of subs) {
    monthlySpend += toMonthlyRate(parseFloat(sub.price), sub.billingCycle);
    if (
      sub.nextRenewalDate >= todayStr &&
      sub.nextRenewalDate <= sevenDaysLaterStr
    ) {
      upcomingRenewals++;
    }
  }

  return Response.json({
    monthlySpend: monthlySpend.toFixed(2),
    yearlySpend: (monthlySpend * 12).toFixed(2),
    activeCount: subs.length,
    upcomingRenewals,
  });
}
