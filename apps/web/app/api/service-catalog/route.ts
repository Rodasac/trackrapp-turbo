import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { ilike } from "drizzle-orm";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;

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
