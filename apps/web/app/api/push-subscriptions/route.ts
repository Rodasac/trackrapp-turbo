import { db, schema } from "@repo/database";
import {
  requireSession,
  requireProSubscription,
  validationErrorResponse,
} from "@/lib/api/helpers";
import { pushSubscriptionSchema } from "@repo/shared/validations";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const proResult = await requireProSubscription(session.user.id);
  if ("error" in proResult) return proResult.error;

  const body = await request.json();
  const parsed = pushSubscriptionSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const { endpoint, keys } = parsed.data;

  // Upsert: if endpoint already exists for this user, it's a no-op
  const existing = await db.query.pushSubscriptions.findFirst({
    where: and(
      eq(schema.pushSubscriptions.userId, session.user.id),
      eq(schema.pushSubscriptions.endpoint, endpoint),
    ),
  });

  if (existing) {
    return Response.json(existing);
  }

  const [created] = await db
    .insert(schema.pushSubscriptions)
    .values({
      userId: session.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    })
    .returning();

  return Response.json(created, { status: 201 });
}

export async function DELETE(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const proResult = await requireProSubscription(session.user.id);
  if ("error" in proResult) return proResult.error;

  const url = new URL(request.url);
  const endpoint = url.searchParams.get("endpoint");
  if (!endpoint) {
    return Response.json(
      { error: "endpoint query param required" },
      { status: 400 },
    );
  }

  await db
    .delete(schema.pushSubscriptions)
    .where(
      and(
        eq(schema.pushSubscriptions.userId, session.user.id),
        eq(schema.pushSubscriptions.endpoint, endpoint),
      ),
    );

  return Response.json({ success: true });
}
