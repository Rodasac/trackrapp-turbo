/**
 * Integration test for the send-reminders job.
 *
 * Prerequisites (run before this test):
 *   docker compose up -d
 *
 * Environment variables required:
 *   DATABASE_URL=postgresql://trackrapp:trackrapp@localhost:5432/trackrapp
 *   SMTP_HOST=localhost  SMTP_PORT=1025  SMTP_SECURE=false
 *   SMTP_FROM=noreply@trackrapp.local
 *   VAPID_PUBLIC_KEY=...  VAPID_PRIVATE_KEY=...  VAPID_SUBJECT=mailto:test@example.com
 *
 * The test:
 *   1. Seeds a user + subscription renewing tomorrow with emailEnabled=true
 *   2. Runs send-reminders
 *   3. Asserts notification record created in DB
 *   4. Asserts email received by Mailpit (via REST API at http://localhost:8025)
 *   5. Cleans up seeded data
 *
 * Skip gracefully if Mailpit/DB are unavailable (e.g. in CI without Docker).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://localhost:8025";
const DATABASE_URL = process.env.DATABASE_URL;
const SKIP_INTEGRATION =
  !DATABASE_URL || process.env.SKIP_INTEGRATION === "true";

async function mailpitAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${MAILPIT_URL}/api/v1/info`, {
      signal: AbortSignal.timeout(2_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

describe.skipIf(SKIP_INTEGRATION)("send-reminders integration", () => {
  let testUserId: string | null = null;
  let testSubId: number | null = null;
  let mailpitUp = false;

  beforeAll(async () => {
    mailpitUp = await mailpitAvailable();
    if (!mailpitUp) {
      console.warn(
        "[integration] Mailpit not available — email assertions skipped",
      );
    }

    // Import DB after env check
    const { db: database, schema } = await import("@repo/database");
    const { eq } = await import("drizzle-orm");

    // Create a test user
    testUserId = `integration-test-${Date.now()}`;
    await database.insert(schema.users).values({
      id: testUserId,
      name: "Integration Test User",
      email: `integration-${Date.now()}@test.local`,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Renewing tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const renewalDate = tomorrow.toISOString().slice(0, 10);

    // Create subscription
    const [sub] = await database
      .insert(schema.trackedSubscriptions)
      .values({
        userId: testUserId,
        name: "Integration Test Sub",
        price: "9.99",
        currency: "USD",
        billingCycle: "monthly",
        nextRenewalDate: renewalDate,
        isActive: true,
      })
      .returning();
    testSubId = sub!.id;

    // Create notification preferences: email on, remind 1 day before
    await database.insert(schema.notificationPreferences).values({
      userId: testUserId,
      emailEnabled: true,
      pushEnabled: false,
      reminderDaysBefore: [1],
    });

    void eq;
  });

  afterAll(async () => {
    if (!testUserId) return;
    const { db: database, schema } = await import("@repo/database");
    const { eq } = await import("drizzle-orm");

    // Clean up in reverse order
    await database
      .delete(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.userId, testUserId!));
    await database
      .delete(schema.notifications)
      .where(eq(schema.notifications.userId, testUserId!));
    if (testSubId) {
      await database
        .delete(schema.trackedSubscriptions)
        .where(eq(schema.trackedSubscriptions.id, testSubId));
    }
    await database.delete(schema.users).where(eq(schema.users.id, testUserId!));
  });

  it("creates a notification record in the DB after running send-reminders", async () => {
    const { runSendReminders } =
      await import("../../src/jobs/send-reminders.js");
    const { db: database, schema } = await import("@repo/database");
    const { and, eq } = await import("drizzle-orm");

    await runSendReminders();

    const notifications = await database
      .select()
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, testUserId!),
          eq(schema.notifications.type, "renewal_reminder"),
        ),
      );

    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0]!.relatedSubscriptionId).toBe(testSubId);
    expect(notifications[0]!.isRead).toBe(false);
  });

  it("does not create a duplicate notification on second run (dedup)", async () => {
    const { runSendReminders } =
      await import("../../src/jobs/send-reminders.js");
    const { db: database, schema } = await import("@repo/database");
    const { and, eq } = await import("drizzle-orm");

    await runSendReminders();

    const notifications = await database
      .select()
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, testUserId!),
          eq(schema.notifications.type, "renewal_reminder"),
        ),
      );

    // Should still be exactly 1 (dedup prevents second insert)
    expect(notifications.length).toBe(1);
  });

  it.skipIf(!mailpitUp)("delivers email to Mailpit inbox", async () => {
    // Query Mailpit REST API for messages
    const res = await fetch(`${MAILPIT_URL}/api/v1/messages`);
    expect(res.ok).toBe(true);
    const { messages } = (await res.json()) as {
      messages: Array<{ Subject: string; To: Array<{ Address: string }> }>;
    };

    const reminder = messages.find((m) =>
      m.Subject.toLowerCase().includes("integration test sub"),
    );
    expect(reminder).toBeDefined();
  });
});
