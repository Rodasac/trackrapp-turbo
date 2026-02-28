import { db, schema } from "@repo/database";
import { eq, and, inArray } from "drizzle-orm";
import { validateAiEnv } from "../env.js";
import { getAiModel, generateTipsForUser } from "../services/ai.js";
import { createNotification } from "../services/notification.js";
import type { SubscriptionForPrompt } from "../services/ai.js";

export async function generateAiTips(): Promise<void> {
  const aiEnv = validateAiEnv();
  if (!aiEnv) {
    console.log("[generate-ai-tips] No AI API key configured — skipping");
    return;
  }

  const model = getAiModel(aiEnv.provider);

  // Find Pro users (active or trialing Stripe subscription)
  const proUsers = await db
    .select({ referenceId: schema.subscriptions.referenceId })
    .from(schema.subscriptions)
    .where(
      inArray(schema.subscriptions.status, ["active", "trialing"]),
    );

  if (proUsers.length === 0) {
    console.log("[generate-ai-tips] No Pro users found — skipping");
    return;
  }

  console.log(`[generate-ai-tips] Processing ${proUsers.length} Pro user(s)`);
  let generated = 0;

  for (const proUser of proUsers) {
    try {
      // Fetch active subscriptions
      const subs = await db
        .select()
        .from(schema.trackedSubscriptions)
        .where(
          and(
            eq(schema.trackedSubscriptions.userId, proUser.referenceId),
            eq(schema.trackedSubscriptions.isActive, true),
          ),
        );

      if (subs.length === 0) {
        console.log(`[generate-ai-tips] User ${proUser.referenceId}: 0 subs — skipping`);
        continue;
      }

      const subsForPrompt: SubscriptionForPrompt[] = subs.map((s) => ({
        name: s.name,
        price: s.price,
        currency: s.currency,
        billingCycle: s.billingCycle,
        categoryName: null,
      }));

      const totalMonthly = subs.reduce((sum, s) => sum + parseFloat(s.price), 0);

      // Delete old tips before generating new ones
      await db
        .delete(schema.aiTips)
        .where(eq(schema.aiTips.userId, proUser.referenceId));

      // Generate new tips
      const tips = await generateTipsForUser(model, subsForPrompt, totalMonthly);

      if (tips.length === 0) {
        console.log(`[generate-ai-tips] User ${proUser.referenceId}: AI returned 0 tips`);
        continue;
      }

      // Insert with 8-day expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 8);

      await db.insert(schema.aiTips).values(
        tips.map((tip) => ({
          userId: proUser.referenceId,
          title: tip.title,
          message: tip.message,
          category: tip.category,
          expiresAt,
        })),
      );

      // Notify user
      await createNotification({
        userId: proUser.referenceId,
        type: "tip",
        title: "New AI Tips Available",
        message: `${tips.length} new personalized spending tip${tips.length > 1 ? "s" : ""} generated for you.`,
      });

      generated++;
      console.log(`[generate-ai-tips] User ${proUser.referenceId}: ${tips.length} tips generated`);
    } catch (error) {
      console.error(`[generate-ai-tips] Error for user ${proUser.referenceId}:`, error);
    }
  }

  console.log(`[generate-ai-tips] Done — ${generated}/${proUsers.length} users processed`);
}
