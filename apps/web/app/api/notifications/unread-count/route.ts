import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { and, count, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const [row] = await db
    .select({ count: count() })
    .from(schema.notifications)
    .where(
      and(
        eq(schema.notifications.userId, session.user.id),
        eq(schema.notifications.isRead, false),
      ),
    );

  return Response.json({ count: row?.count ?? 0 });
}
