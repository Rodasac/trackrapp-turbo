import { db, schema } from "@repo/database";
import { requireSession, parseIdParam } from "@/lib/api/helpers";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const { id } = await params;
  const parsed = parseIdParam(id);
  if ("error" in parsed) return parsed.error;
  const { idNum } = parsed;

  const [updated] = await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(schema.notifications.id, idNum),
        eq(schema.notifications.userId, session.user.id),
      ),
    )
    .returning();

  if (!updated) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(updated);
}
