import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { eq, and } from "drizzle-orm";
import { generateStaticTips } from "@/lib/tips";
import type { SubscriptionListItem } from "@/lib/types/api";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const subs = await db.query.trackedSubscriptions.findMany({
    where: and(
      eq(schema.trackedSubscriptions.userId, session.user.id),
      eq(schema.trackedSubscriptions.isActive, true),
    ),
    with: { category: true },
  });

  // Map to SubscriptionListItem shape
  const items: SubscriptionListItem[] = subs.map((sub) => ({
    id: sub.id,
    name: sub.name,
    price: sub.price,
    currency: sub.currency,
    billingCycle: sub.billingCycle,
    nextRenewalDate: sub.nextRenewalDate,
    isActive: sub.isActive,
    logoUrl: sub.logoUrl,
    websiteUrl: sub.websiteUrl,
    category: sub.category
      ? {
          id: sub.category.id,
          name: sub.category.name,
          color: sub.category.color,
          icon: sub.category.icon,
          userId: sub.category.userId,
        }
      : null,
  }));

  const tips = generateStaticTips(items);
  return Response.json(tips);
}
