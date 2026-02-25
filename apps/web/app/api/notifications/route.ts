import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { and, desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const url = new URL(request.url);
  const readParam = url.searchParams.get("read");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  const notifications = await db.query.notifications.findMany({
    where: and(
      eq(schema.notifications.userId, session.user.id),
      readParam !== null
        ? eq(schema.notifications.isRead, readParam === "true")
        : undefined,
    ),
    orderBy: [desc(schema.notifications.createdAt)],
    limit,
    offset,
  });

  return Response.json(notifications);
}
