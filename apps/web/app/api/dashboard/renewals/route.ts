import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { toDateString } from "@repo/shared/dates";
import { and, asc, eq, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const today = new Date();
  const todayStr = toDateString(today);
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysLaterStr = toDateString(thirtyDaysLater);

  const subs = await db
    .select()
    .from(schema.trackedSubscriptions)
    .where(
      and(
        eq(schema.trackedSubscriptions.userId, session.user.id),
        eq(schema.trackedSubscriptions.isActive, true),
        gte(schema.trackedSubscriptions.nextRenewalDate, todayStr),
        lte(schema.trackedSubscriptions.nextRenewalDate, thirtyDaysLaterStr),
      ),
    )
    .orderBy(asc(schema.trackedSubscriptions.nextRenewalDate));

  const renewals = subs.map((sub) => ({
    id: sub.id,
    name: sub.name,
    price: sub.price,
    currency: sub.currency,
    billingCycle: sub.billingCycle,
    nextRenewalDate: sub.nextRenewalDate,
    logoUrl: sub.logoUrl,
  }));

  return Response.json(renewals);
}
