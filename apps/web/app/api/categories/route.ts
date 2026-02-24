import { db, schema } from "@repo/database";
import { requireSession, validationErrorResponse } from "@/lib/api/helpers";
import { categoryFormSchema } from "@repo/shared/validations";
import { asc, eq, isNull, or } from "drizzle-orm";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const cats = await db
    .select()
    .from(schema.categories)
    .where(
      or(
        isNull(schema.categories.userId),
        eq(schema.categories.userId, session.user.id),
      ),
    )
    .orderBy(asc(schema.categories.name));

  return Response.json(cats);
}

export async function POST(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const body = await request.json();
  const parsed = categoryFormSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const [category] = await db
    .insert(schema.categories)
    .values({ ...parsed.data, userId: session.user.id })
    .returning();

  return Response.json(category, { status: 201 });
}
