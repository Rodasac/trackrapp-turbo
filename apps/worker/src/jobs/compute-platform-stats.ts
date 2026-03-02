import { db, schema } from "@repo/database";
import { eq } from "drizzle-orm";
import { count } from "drizzle-orm";
import { toMonthlyRate } from "@repo/shared/billing";
import { platformStatsLog } from "../logger.js";

/**
 * Computes platform-wide stats and inserts a new row into platform_stats.
 * The API reads the latest row by computedAt DESC.
 */
export async function computePlatformStats(): Promise<void> {
  platformStatsLog.info("Computing platform stats...");

  // 1. Total subscriptions (all-time, active + inactive)
  const subsRows = await db
    .select({ count: count() })
    .from(schema.trackedSubscriptions);
  const totalSubscriptions = subsRows[0]?.count ?? 0;

  // 2. Total users
  const usersRows = await db.select({ count: count() }).from(schema.users);
  const totalUsers = usersRows[0]?.count ?? 0;

  // 3. Total reminders sent
  const remindersRows = await db
    .select({ count: count() })
    .from(schema.notifications)
    .where(eq(schema.notifications.type, "renewal_reminder"));
  const totalReminders = remindersRows[0]?.count ?? 0;

  // 4. Money saved — sum of monthly-normalised prices of deactivated subs
  const deactivatedSubs = await db
    .select({
      price: schema.trackedSubscriptions.price,
      billingCycle: schema.trackedSubscriptions.billingCycle,
    })
    .from(schema.trackedSubscriptions)
    .where(eq(schema.trackedSubscriptions.isActive, false));

  const totalSaved = deactivatedSubs.reduce(
    (sum, s) => sum + toMonthlyRate(Number(s.price), s.billingCycle),
    0,
  );

  await db.insert(schema.platformStats).values({
    totalSubscriptions,
    totalUsers,
    totalReminders,
    totalSaved: totalSaved.toFixed(2),
  });

  platformStatsLog.info(
    { totalSubscriptions, totalUsers, totalReminders, totalSaved },
    "Platform stats computed and saved",
  );
}
