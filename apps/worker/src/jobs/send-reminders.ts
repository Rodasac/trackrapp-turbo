import { db, schema } from "@repo/database";
import { and, eq, inArray } from "drizzle-orm";
import {
  createNotification,
  hasExistingReminder,
} from "../services/notification.js";
import { createTransporter, sendRenewalReminder } from "../services/email.js";
import { sendPushNotification } from "../services/push.js";
import { validateEnv } from "../env.js";

const DEFAULT_REMINDER_DAYS = [7, 3, 1];

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export async function runSendReminders(): Promise<void> {
  const env = validateEnv();
  const transporter = createTransporter({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute the union of all possible reminder windows (1–30 days out)
  const possibleDays = Array.from({ length: 30 }, (_, i) => i + 1);
  const targetDates = possibleDays.map((n) => toDateString(addDays(today, n)));

  // 1. Fetch active subscriptions renewing on any target date, with user info
  const subscriptions = await db.query.trackedSubscriptions.findMany({
    where: and(
      inArray(schema.trackedSubscriptions.nextRenewalDate, targetDates),
      eq(schema.trackedSubscriptions.isActive, true),
    ),
    with: { user: true },
  });

  if (subscriptions.length === 0) {
    console.log("[send-reminders] No subscriptions to remind");
    return;
  }

  // 2. Batch-fetch notification preferences and push subscriptions for these users
  const userIds = [...new Set(subscriptions.map((s) => s.userId))];

  const prefsRows = await db
    .select()
    .from(schema.notificationPreferences)
    .where(inArray(schema.notificationPreferences.userId, userIds));

  const prefsMap = new Map(prefsRows.map((p) => [p.userId, p]));

  const pushRows = await db
    .select()
    .from(schema.pushSubscriptions)
    .where(inArray(schema.pushSubscriptions.userId, userIds));

  const pushMap = new Map<string, typeof pushRows>();
  for (const ps of pushRows) {
    if (!pushMap.has(ps.userId)) pushMap.set(ps.userId, []);
    pushMap.get(ps.userId)!.push(ps);
  }

  // 3. Process each subscription
  let sent = 0;

  for (const sub of subscriptions) {
    const prefs = prefsMap.get(sub.userId) ?? null;
    const reminderDays = prefs?.reminderDaysBefore ?? DEFAULT_REMINDER_DAYS;
    const emailEnabled = prefs?.emailEnabled ?? true;
    const pushEnabled = prefs?.pushEnabled ?? false;

    // Compute how many days until renewal
    const renewalDate = new Date(sub.nextRenewalDate + "T00:00:00");
    const msPerDay = 86_400_000;
    const daysUntil = Math.round(
      (renewalDate.getTime() - today.getTime()) / msPerDay,
    );

    // Only send if this day is in the user's configured reminder windows
    if (!reminderDays.includes(daysUntil)) continue;

    // Dedup: skip if we already sent a reminder for this subscription recently
    if (await hasExistingReminder(sub.id, sub.nextRenewalDate)) continue;

    const dayLabel = daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`;

    // Create in-app notification
    await createNotification({
      userId: sub.userId,
      type: "renewal_reminder",
      title: `${sub.name} renews ${dayLabel}`,
      message: `Your ${sub.name} subscription (${sub.currency} ${sub.price}) renews ${dayLabel}.`,
      relatedSubscriptionId: sub.id,
    });

    // Send email
    if (emailEnabled && sub.user.email) {
      await sendRenewalReminder(transporter, {
        to: sub.user.email,
        from: env.SMTP_FROM,
        subscriptionName: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysUntilRenewal: daysUntil,
      });
    }

    // Send push to all user's push subscriptions
    if (pushEnabled) {
      const userPushSubs = pushMap.get(sub.userId) ?? [];
      for (const pushSub of userPushSubs) {
        await sendPushNotification(
          {
            endpoint: pushSub.endpoint,
            keys: { p256dh: pushSub.p256dh, auth: pushSub.auth },
          },
          {
            title: `${sub.name} renews ${dayLabel}`,
            message: `${sub.currency} ${sub.price}`,
            url: `/subscriptions/${sub.id}`,
          },
        );
      }
    }

    sent++;
  }

  console.log(
    `[send-reminders] Sent ${sent} reminders for ${subscriptions.length} subscriptions checked`,
  );
}
