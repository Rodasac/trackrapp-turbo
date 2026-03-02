import { db, schema } from "@repo/database";
import { desc } from "drizzle-orm";

export async function GET() {
  const [latest] = await db
    .select()
    .from(schema.platformStats)
    .orderBy(desc(schema.platformStats.computedAt))
    .limit(1);

  if (!latest) {
    return Response.json({
      totalSubscriptions: 0,
      totalUsers: 0,
      totalReminders: 0,
      totalSaved: "0",
      computedAt: null,
    });
  }

  return Response.json(latest);
}
