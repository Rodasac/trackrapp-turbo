import { db, schema } from "@repo/database";
import { eq, and, lte, inArray } from "drizzle-orm";
import { computeNextRenewalDate } from "@repo/shared/billing";
import { toDateString } from "@repo/shared/dates";

/**
 * Advance nextRenewalDate for all due subscriptions where auto-renew is enabled.
 * Returns the count of successfully renewed subscriptions.
 */
export async function runAutoRenew(): Promise<number> {
  const today = toDateString(new Date());

  // Load all active subscriptions whose renewal date has passed
  const candidates = await db.query.trackedSubscriptions.findMany({
    where: and(
      eq(schema.trackedSubscriptions.isActive, true),
      lte(schema.trackedSubscriptions.nextRenewalDate, today),
    ),
  });

  if (candidates.length === 0) {
    console.log("[auto-renew] No subscriptions due for renewal");
    return 0;
  }

  // Fetch user preferences for all involved users in a single query
  const userIds = [...new Set(candidates.map((s) => s.userId))];
  const prefsRows = await db
    .select()
    .from(schema.userPreferences)
    .where(inArray(schema.userPreferences.userId, userIds));

  const prefsMap = new Map(prefsRows.map((p) => [p.userId, p]));

  // Filter: autoRenew = true, OR autoRenew is null + user default = true (or no pref row = true)
  const toRenew = candidates.filter((sub) => {
    if (sub.autoRenew === true) return true;
    if (sub.autoRenew === false) return false;
    const pref = prefsMap.get(sub.userId);
    return pref?.autoRenewDefault !== false; // no row → default true
  });

  if (toRenew.length === 0) {
    console.log("[auto-renew] No subscriptions eligible for auto-renewal");
    return 0;
  }

  let renewed = 0;
  for (const sub of toRenew) {
    try {
      const newDate = computeNextRenewalDate(sub.nextRenewalDate, sub.billingCycle);
      await db
        .update(schema.trackedSubscriptions)
        .set({
          previousRenewalDate: sub.nextRenewalDate,
          nextRenewalDate: newDate,
        })
        .where(eq(schema.trackedSubscriptions.id, sub.id))
        .execute();
      renewed++;
    } catch (err) {
      console.error(`[auto-renew] Failed to renew subscription ${sub.id}:`, err);
    }
  }

  const uniqueUsers = new Set(toRenew.map((s) => s.userId)).size;
  console.log(
    `[auto-renew] Renewed ${renewed} subscriptions for ${uniqueUsers} users`,
  );
  return renewed;
}
