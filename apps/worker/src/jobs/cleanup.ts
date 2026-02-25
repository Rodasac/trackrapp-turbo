import { db, schema } from "@repo/database";
import { and, eq, lt } from "drizzle-orm";

const RETENTION_DAYS = 30;

// Delete read notifications older than RETENTION_DAYS days.
// Unread notifications are kept indefinitely.
export async function runCleanup(): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const result = (await db
    .delete(schema.notifications)
    .where(
      and(
        eq(schema.notifications.isRead, true),
        lt(schema.notifications.createdAt, cutoff),
      ),
    )
    .execute()) as { rowCount?: number };

  const deleted = result?.rowCount ?? 0;
  console.log(`[cleanup] Deleted ${deleted} read notifications older than ${RETENTION_DAYS} days`);
  return deleted;
}
