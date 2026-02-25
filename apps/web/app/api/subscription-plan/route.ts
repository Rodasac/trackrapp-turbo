import { eq, and, inArray } from "drizzle-orm";
import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import type { SubscriptionPlanResponse } from "@/lib/types/api";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const userId = session.user.id;

  // Find the most recent active/trialing subscription record for this user.
  // A user with no record (or only canceled records) is on the Free plan.
  const [record] = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.referenceId, userId),
        inArray(schema.subscriptions.status, ["active", "trialing"]),
      ),
    )
    .limit(1);

  if (!record) {
    const freePlan: SubscriptionPlanResponse = {
      plan: "free",
      status: null,
      isTrialing: false,
      trialEnd: null,
      cancelAtPeriodEnd: false,
      periodEnd: null,
      stripeSubscriptionId: null,
    };
    return Response.json(freePlan);
  }

  const status = record.status as SubscriptionPlanResponse["status"];
  const response: SubscriptionPlanResponse = {
    plan: "pro",
    status,
    isTrialing: status === "trialing",
    trialEnd: record.trialEnd ? record.trialEnd.toISOString() : null,
    cancelAtPeriodEnd: record.cancelAtPeriodEnd,
    periodEnd: record.periodEnd ? record.periodEnd.toISOString() : null,
    stripeSubscriptionId: record.stripeSubscriptionId,
  };

  return Response.json(response);
}
