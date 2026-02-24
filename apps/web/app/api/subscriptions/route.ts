import { db, schema } from "@repo/database";
import { requireSession, validationErrorResponse } from "@/lib/api/helpers";
import { subscriptionFormSchema } from "@repo/shared/validations";
import { and, asc, desc, eq, ilike } from "drizzle-orm";

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const url = new URL(request.url);
  const categoryParam = url.searchParams.get("category");
  const search = url.searchParams.get("search") ?? "";
  const sort = url.searchParams.get("sort") ?? "nextRenewalDate";
  const order = url.searchParams.get("order") ?? "asc";
  const activeParam = url.searchParams.get("active");

  const categoryNum =
    categoryParam && !isNaN(parseInt(categoryParam))
      ? parseInt(categoryParam)
      : null;

  const subs = await db.query.trackedSubscriptions.findMany({
    where: and(
      eq(schema.trackedSubscriptions.userId, session.user.id),
      search ? ilike(schema.trackedSubscriptions.name, `%${search}%`) : undefined,
      categoryNum !== null
        ? eq(schema.trackedSubscriptions.categoryId, categoryNum)
        : undefined,
      activeParam !== null
        ? eq(schema.trackedSubscriptions.isActive, activeParam === "true")
        : undefined,
    ),
    with: { category: true },
    orderBy: (() => {
      const col = {
        name: schema.trackedSubscriptions.name,
        price: schema.trackedSubscriptions.price,
        createdAt: schema.trackedSubscriptions.createdAt,
        nextRenewalDate: schema.trackedSubscriptions.nextRenewalDate,
      }[sort] ?? schema.trackedSubscriptions.nextRenewalDate;
      return [order === "desc" ? desc(col) : asc(col)];
    })(),
  });

  return Response.json(subs);
}

export async function POST(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const body = await request.json();
  const parsed = subscriptionFormSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const { data } = parsed;

  const inserted = await db
    .insert(schema.trackedSubscriptions)
    .values({
      userId: session.user.id,
      name: data.name,
      price: data.price,
      currency: data.currency,
      billingCycle: data.billingCycle,
      nextRenewalDate: data.nextRenewalDate,
      startDate: data.startDate || null,
      categoryId: data.categoryId ?? null,
      serviceCatalogId: data.serviceCatalogId ?? null,
      logoUrl: data.logoUrl || null,
      websiteUrl: data.websiteUrl || null,
      description: data.description || null,
      notes: data.notes || null,
    })
    .returning();

  const sub = inserted[0]!;

  await db.insert(schema.priceHistory).values({
    trackedSubscriptionId: sub.id,
    price: sub.price,
  });

  return Response.json(sub, { status: 201 });
}
