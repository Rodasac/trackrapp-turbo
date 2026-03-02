import { db, schema } from "@repo/database";
import { and, eq, isNotNull, lt } from "drizzle-orm";
import { toDateString } from "@repo/shared/dates";
import { cleanupLog } from "../logger.js";

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
  cleanupLog.info(
    { deleted, retentionDays: RETENTION_DAYS },
    "Deleted read notifications",
  );

  // Clear previousRenewalDate values older than 30 days (safety net for undo window)
  const renewalCutoffDate = new Date();
  renewalCutoffDate.setDate(renewalCutoffDate.getDate() - RETENTION_DAYS);
  const renewalCutoff = toDateString(renewalCutoffDate);

  const renewalResult = (await db
    .update(schema.trackedSubscriptions)
    .set({ previousRenewalDate: null })
    .where(
      and(
        isNotNull(schema.trackedSubscriptions.previousRenewalDate),
        lt(schema.trackedSubscriptions.previousRenewalDate, renewalCutoff),
      ),
    )
    .execute()) as { rowCount?: number };

  const clearedRenewals = renewalResult?.rowCount ?? 0;
  cleanupLog.info(
    { clearedRenewals, retentionDays: RETENTION_DAYS },
    "Cleared stale previousRenewalDate values",
  );

  return deleted;
}
