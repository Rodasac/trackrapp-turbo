import { db, schema } from "@repo/database";
import { requireSession, validationErrorResponse } from "@/lib/api/helpers";
import { notificationPreferencesSchema } from "@repo/shared/validations";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  // Return existing prefs or create defaults on first access
  let prefs = await db.query.notificationPreferences.findFirst({
    where: eq(schema.notificationPreferences.userId, session.user.id),
  });

  if (!prefs) {
    const [created] = await db
      .insert(schema.notificationPreferences)
      .values({ userId: session.user.id })
      .returning();
    prefs = created;
  }

  return Response.json(prefs);
}

export async function PUT(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const body = await request.json();
  const parsed = notificationPreferencesSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const { emailEnabled, pushEnabled, reminderDaysBefore } = parsed.data;

  // Upsert: insert defaults if not exists, then update
  const existing = await db.query.notificationPreferences.findFirst({
    where: eq(schema.notificationPreferences.userId, session.user.id),
  });

  if (!existing) {
    await db
      .insert(schema.notificationPreferences)
      .values({ userId: session.user.id });
  }

  const [updated] = await db
    .update(schema.notificationPreferences)
    .set({ emailEnabled, pushEnabled, reminderDaysBefore })
    .where(eq(schema.notificationPreferences.userId, session.user.id))
    .returning();

  return Response.json(updated);
}
