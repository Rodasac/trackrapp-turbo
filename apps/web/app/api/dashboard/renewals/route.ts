import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { and, eq, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]!;
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split("T")[0]!;

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
    );

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
