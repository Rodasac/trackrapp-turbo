import { db, schema } from "@repo/database";
import { and, eq, gt, desc } from "drizzle-orm";
import { requireSession, requireProSubscription } from "@/lib/api/helpers";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const userId = session.user.id;

  const proResult = await requireProSubscription(
    userId,
    (session.user as { role?: string }).role,
  );
  if ("error" in proResult) return proResult.error;

  // Fetch non-expired tips
  const tips = await db
    .select()
    .from(schema.aiTips)
    .where(
      and(
        eq(schema.aiTips.userId, userId),
        gt(schema.aiTips.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(schema.aiTips.generatedAt));

  return Response.json(tips);
}
