import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updatePreferencesSchema = z.object({
  autoRenewDefault: z.boolean(),
});

async function getOrCreatePreferences(userId: string) {
  const existing = await db.query.userPreferences.findFirst({
    where: eq(schema.userPreferences.userId, userId),
  });
  if (existing) return existing;

  await db
    .insert(schema.userPreferences)
    .values({ userId })
    .onConflictDoNothing()
    .returning();

  return db.query.userPreferences.findFirst({
    where: eq(schema.userPreferences.userId, userId),
  });
}

export async function GET(request: Request) {
  const authResult = await requireSession(request);
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const prefs = await getOrCreatePreferences(session.user.id);
  return Response.json(prefs);
}

export async function PUT(request: Request) {
  const authResult = await requireSession(request);
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const body = await request.json();
  const parsed = updatePreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Ensure row exists before updating
  await db
    .insert(schema.userPreferences)
    .values({ userId: session.user.id })
    .onConflictDoNothing()
    .returning();

  const [updated] = await db
    .update(schema.userPreferences)
    .set({ autoRenewDefault: parsed.data.autoRenewDefault })
    .where(eq(schema.userPreferences.userId, session.user.id))
    .returning();

  return Response.json(updated);
}
