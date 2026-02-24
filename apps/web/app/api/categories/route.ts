import { auth } from "@/lib/auth";
import { db, schema } from "@repo/database";
import { categoryFormSchema } from "@/lib/validations/subscription";
import { asc, eq, isNull, or } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

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
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = categoryFormSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 },
    );
  }

  const [category] = await db
    .insert(schema.categories)
    .values({ ...result.data, userId: session.user.id })
    .returning();

  return Response.json(category, { status: 201 });
}
