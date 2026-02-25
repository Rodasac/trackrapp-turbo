import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(schema.notifications.userId, session.user.id),
        eq(schema.notifications.isRead, false),
      ),
    );

  return Response.json({ success: true });
}
