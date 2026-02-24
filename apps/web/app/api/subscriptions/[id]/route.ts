import { db, schema } from "@repo/database";
import {
  requireSession,
  validationErrorResponse,
  parseIdParam,
} from "@/lib/api/helpers";
import { subscriptionFormSchema } from "@repo/shared/validations";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    with: {
      category: true,
      serviceCatalog: true,
      priceHistory: {
        orderBy: (ph, { desc }) => [desc(ph.recordedAt)],
      },
    },
  });

  if (!sub) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(sub);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireSession(request);
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const { id } = await params;
  const idResult = parseIdParam(id);
  if ("error" in idResult) return idResult.error;
  const { idNum } = idResult;

  const body = await request.json();
  const parsed = subscriptionFormSchema.partial().safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const existing = await db.query.trackedSubscriptions.findFirst({
    where: and(
      eq(schema.trackedSubscriptions.id, idNum),
      eq(schema.trackedSubscriptions.userId, session.user.id),
    ),
  });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const { data } = parsed;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.billingCycle !== undefined) updateData.billingCycle = data.billingCycle;
  if (data.nextRenewalDate !== undefined)
    updateData.nextRenewalDate = data.nextRenewalDate;
  if (data.startDate !== undefined) updateData.startDate = data.startDate || null;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId ?? null;
  if (data.serviceCatalogId !== undefined)
    updateData.serviceCatalogId = data.serviceCatalogId ?? null;
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl || null;
  if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl || null;
  if (data.description !== undefined)
    updateData.description = data.description || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  const [updated] = await db
    .update(schema.trackedSubscriptions)
    .set(updateData)
    .where(eq(schema.trackedSubscriptions.id, idNum))
    .returning();

  if (data.price !== undefined && data.price !== existing.price) {
    await db.insert(schema.priceHistory).values({
      trackedSubscriptionId: idNum,
      price: data.price,
    });
  }

  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireSession(request);
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const { id } = await params;
  const idResult = parseIdParam(id);
  if ("error" in idResult) return idResult.error;
  const { idNum } = idResult;

  const url = new URL(request.url);
  const hard = url.searchParams.get("hard") === "true";

  const existing = await db.query.trackedSubscriptions.findFirst({
    where: and(
      eq(schema.trackedSubscriptions.id, idNum),
      eq(schema.trackedSubscriptions.userId, session.user.id),
    ),
  });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  if (hard) {
    await db
      .delete(schema.trackedSubscriptions)
      .where(eq(schema.trackedSubscriptions.id, idNum));
    return Response.json({ deleted: true });
  } else {
    await db
      .update(schema.trackedSubscriptions)
      .set({ isActive: false })
      .where(eq(schema.trackedSubscriptions.id, idNum));
    return Response.json({ deactivated: true });
  }
}
