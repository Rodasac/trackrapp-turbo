import { db, schema } from "@repo/database";
import { requireSession, requireProSubscription } from "@/lib/api/helpers";
import type { CsvImportResult } from "@/lib/types/api";

interface ConfirmedImportRow {
  name: string;
  price: string;
  currency: string;
  billingCycle: "monthly" | "yearly" | "weekly" | "quarterly";
  nextRenewalDate: string;
  startDate?: string | null;
  categoryId?: number | null;
  serviceCatalogId?: number | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
}

export async function POST(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const proResult = await requireProSubscription(session.user.id);
  if ("error" in proResult) return proResult.error;

  const body = (await request.json()) as { rows: ConfirmedImportRow[] };
  const rows: ConfirmedImportRow[] = body.rows ?? [];

  let imported = 0;
  let failed = 0;
  const errors: CsvImportResult["errors"] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    try {
      const inserted = await db
        .insert(schema.trackedSubscriptions)
        .values({
          userId: session.user.id,
          name: row.name,
          price: row.price,
          currency: row.currency,
          billingCycle: row.billingCycle,
          nextRenewalDate: row.nextRenewalDate,
          startDate: row.startDate ?? null,
          categoryId: row.categoryId ?? null,
          serviceCatalogId: row.serviceCatalogId ?? null,
          logoUrl: row.logoUrl ?? null,
          websiteUrl: row.websiteUrl ?? null,
        })
        .returning();

      const sub = inserted[0]!;

      await db.insert(schema.priceHistory).values({
        trackedSubscriptionId: sub.id,
        price: sub.price,
      });

      imported++;
    } catch (err) {
      failed++;
      errors.push({
        rowIndex: i,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const response: CsvImportResult = { imported, failed, errors };
  return Response.json(response);
}
