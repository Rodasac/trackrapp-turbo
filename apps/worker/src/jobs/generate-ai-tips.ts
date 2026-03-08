import { db, schema } from "@repo/database";
import { eq, and, inArray } from "drizzle-orm";
import { validateAiEnv } from "../env.js";
import { getAiModel, generateTipsForUser } from "../services/ai.js";
import { createNotification } from "../services/notification.js";
import type { SubscriptionForPrompt } from "../services/ai.js";
import { getTranslator } from "@repo/shared/i18n";
import { aiTipsLog } from "../logger.js";

export async function generateAiTips(): Promise<void> {
  const aiEnv = validateAiEnv();
  if (!aiEnv) {
    aiTipsLog.info("No AI API key configured — skipping");
    return;
  }

  const model = getAiModel(aiEnv.provider);

  // Find Pro users (active or trialing Stripe subscription)
  const proUsers = await db
    .select({ referenceId: schema.subscriptions.referenceId })
    .from(schema.subscriptions)
    .where(inArray(schema.subscriptions.status, ["active", "trialing"]));

  // Find admin users (treated as Pro regardless of subscription)
  const adminUsers = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.role, "admin"));

  // Deduplicate: admin may also have a Pro subscription
  const eligibleUserIds = new Set<string>(proUsers.map((u) => u.referenceId));
  for (const admin of adminUsers) {
    eligibleUserIds.add(admin.id);
  }

  if (eligibleUserIds.size === 0) {
    aiTipsLog.info("No eligible users found — skipping");
    return;
  }

  // Batch-fetch user preferences to get locale settings
  const userPrefsRows = await db
    .select()
    .from(schema.userPreferences)
    .where(inArray(schema.userPreferences.userId, [...eligibleUserIds]));
  const userPrefsMap = new Map(userPrefsRows.map((p) => [p.userId, p]));

  aiTipsLog.info({ count: eligibleUserIds.size }, "Processing eligible users");
  let generated = 0;

  for (const userId of eligibleUserIds) {
    try {
      // Fetch active subscriptions
      const subs = await db
        .select()
        .from(schema.trackedSubscriptions)
        .where(
          and(
            eq(schema.trackedSubscriptions.userId, userId),
            eq(schema.trackedSubscriptions.isActive, true),
          ),
        );

      if (subs.length === 0) {
        aiTipsLog.info({ userId }, "0 subs — skipping");
        continue;
      }

      const subsForPrompt: SubscriptionForPrompt[] = subs.map((s) => ({
        name: s.name,
        price: s.price,
        currency: s.currency,
        billingCycle: s.billingCycle,
        categoryName: null,
      }));

      const totalMonthly = subs.reduce(
        (sum, s) => sum + parseFloat(s.price),
        0,
      );

      // Delete old tips before generating new ones
      await db.delete(schema.aiTips).where(eq(schema.aiTips.userId, userId));

      // Generate new tips in the user's preferred language
      const userLocale = userPrefsMap.get(userId)?.locale ?? "en";
      const tips = await generateTipsForUser(
        model,
        subsForPrompt,
        totalMonthly,
        userLocale,
      );

      if (tips.length === 0) {
        aiTipsLog.info({ userId }, "AI returned 0 tips");
        continue;
      }

      // Insert with 8-day expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 8);

      await db.insert(schema.aiTips).values(
        tips.map((tip) => ({
          userId,
          title: tip.title,
          message: tip.message,
          category: tip.category,
          expiresAt,
        })),
      );

      // Notify user with localized strings
      const tn = getTranslator(userLocale, "notification");
      const notifTitle = tn("aiTips.title");
      const notifMessage =
        tips.length === 1
          ? tn("aiTips.messageSingular")
          : tn("aiTips.messagePlural", { count: tips.length });
      await createNotification({
        userId,
        type: "tip",
        title: notifTitle,
        message: notifMessage,
      });

      generated++;
      aiTipsLog.info({ userId, tipsCount: tips.length }, "Tips generated");
    } catch (error) {
      aiTipsLog.error({ err: error, userId }, "Error processing user");
    }
  }

  aiTipsLog.info(
    { generated, total: eligibleUserIds.size },
    "Done processing eligible users",
  );
}
