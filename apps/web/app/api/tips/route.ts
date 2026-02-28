import { db, schema } from "@repo/database";
import { and, eq, gt, inArray, desc } from "drizzle-orm";
import { requireSession } from "@/lib/api/helpers";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const userId = session.user.id;

  // Check Pro status
  const [proRecord] = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.referenceId, userId),
        inArray(schema.subscriptions.status, ["active", "trialing"]),
      ),
    );

  if (!proRecord) {
    return Response.json({ error: "Pro subscription required" }, { status: 403 });
  }

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
