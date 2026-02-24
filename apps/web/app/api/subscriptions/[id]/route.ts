import { auth } from "@/lib/auth";
import { db, schema } from "@repo/database";
import { subscriptionFormSchema } from "@/lib/validations/subscription";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) return Response.json({ error: "Invalid ID" }, { status: 400 });

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
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) return Response.json({ error: "Invalid ID" }, { status: 400 });

  const body = await request.json();
  const result = subscriptionFormSchema.partial().safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 },
    );
  }

  const existing = await db.query.trackedSubscriptions.findFirst({
    where: and(
      eq(schema.trackedSubscriptions.id, idNum),
      eq(schema.trackedSubscriptions.userId, session.user.id),
    ),
  });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const { data } = result;
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

  // Record new price history entry if price changed
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
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) return Response.json({ error: "Invalid ID" }, { status: 400 });

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
