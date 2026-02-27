import { db, schema } from "@repo/database";
import { and, eq, gte } from "drizzle-orm";

export interface CreateNotificationParams {
  userId: string;
  type: "renewal_reminder" | "price_change" | "tip" | "system";
  title: string;
  message: string;
  relatedSubscriptionId?: number;
}

export async function createNotification(
  params: CreateNotificationParams,
): Promise<number> {
  const rows = await db
    .insert(schema.notifications)
    .values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedSubscriptionId: params.relatedSubscriptionId,
      isRead: false,
    })
    .returning();
  if (!rows[0]) throw new Error("Failed to insert notification");
  return rows[0].id;
}

// Check if a renewal_reminder already exists for this subscription/renewal-date combo.
// renewalDate is a "YYYY-MM-DD" string. We look for notifications created on or after
// midnight of that day - 30 days (generous window) to avoid duplicate sends.
export async function hasExistingReminder(
  subscriptionId: number,
  // TODO: we need to pass this in, but it's not currently used in the job.
  renewalDate: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<boolean> {
  // We store one reminder per (subscriptionId, renewalDate) window.
  // The title includes the renewal date, so we query by subscriptionId + type + title pattern.
  // A simpler approach: check if any renewal_reminder for this sub was created in the
  // last 25 days (covers all reminder windows: 1, 3, 7, 14 days before renewal).
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 25);

  const rows = await db
    .select()
    .from(schema.notifications)
    .where(
      and(
        eq(schema.notifications.relatedSubscriptionId, subscriptionId),
        eq(schema.notifications.type, "renewal_reminder"),
        gte(schema.notifications.createdAt, cutoff),
      ),
    )
    .limit(1);

  return rows.length > 0;
}
