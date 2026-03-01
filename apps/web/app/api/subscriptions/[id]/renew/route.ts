import { db, schema } from "@repo/database";
import { requireSession, parseIdParam } from "@/lib/api/helpers";
import { computeNextRenewalDate } from "@repo/shared/billing";
import { and, eq } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const authResult = await requireSession(request);
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const { id } = await params;
  const idResult = parseIdParam(id);
  if ("error" in idResult) return idResult.error;
  const { idNum } = idResult;

  const sub = await db.query.trackedSubscriptions.findFirst({
    where: and(
      eq(schema.trackedSubscriptions.id, idNum),
      eq(schema.trackedSubscriptions.userId, session.user.id),
    ),
  });
  if (!sub) return Response.json({ error: "Not found" }, { status: 404 });

  const newDate = computeNextRenewalDate(sub.nextRenewalDate, sub.billingCycle);

  const [updated] = await db
    .update(schema.trackedSubscriptions)
    .set({
      previousRenewalDate: sub.nextRenewalDate,
      nextRenewalDate: newDate,
    })
    .where(eq(schema.trackedSubscriptions.id, idNum))
    .returning();

  return Response.json(updated);
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const authResult = await requireSession(request);
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const { id } = await params;
  const idResult = parseIdParam(id);
  if ("error" in idResult) return idResult.error;
  const { idNum } = idResult;

  const sub = await db.query.trackedSubscriptions.findFirst({
    where: and(
      eq(schema.trackedSubscriptions.id, idNum),
      eq(schema.trackedSubscriptions.userId, session.user.id),
    ),
  });
  if (!sub) return Response.json({ error: "Not found" }, { status: 404 });

  if (!sub.previousRenewalDate) {
    return Response.json(
      { error: "No previous renewal date to undo" },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(schema.trackedSubscriptions)
    .set({
      nextRenewalDate: sub.previousRenewalDate,
      previousRenewalDate: null,
    })
    .where(eq(schema.trackedSubscriptions.id, idNum))
    .returning();

  return Response.json(updated);
}
