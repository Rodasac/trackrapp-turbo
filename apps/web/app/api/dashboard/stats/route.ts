import { auth } from "@/lib/auth";
import { db, schema } from "@repo/database";
import { and, eq } from "drizzle-orm";

// Normalize any billing cycle to a monthly equivalent cost.
// Uses exact calendar fractions: 52 weeks / 12 months = 4.333…, 365.25 / 12 = 30.44 days/mo
function toMonthlyRate(price: number, billingCycle: string): number {
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

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

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
