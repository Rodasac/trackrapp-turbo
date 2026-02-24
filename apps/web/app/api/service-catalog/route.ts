import { auth } from "@/lib/auth";
import { db, schema } from "@repo/database";
import { ilike } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "10"), 20);

  const results = await db
    .select()
    .from(schema.serviceCatalog)
    .where(q ? ilike(schema.serviceCatalog.name, `%${q}%`) : undefined)
    .limit(limit);

  return Response.json(results);
}
