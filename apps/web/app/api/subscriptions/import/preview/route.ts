import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { csvImportRowSchema } from "@repo/shared/validations";
import { fuzzyMatchService } from "@repo/shared/fuzzy-match";
import { eq, or, isNull } from "drizzle-orm";
import type { CsvImportPreviewRow } from "@/lib/types/api";

interface RawImportRow {
  name: string;
  price: string;
  currency?: string;
  billingCycle: string;
  nextRenewalDate: string;
  startDate?: string;
  categoryName?: string;
}

export async function POST(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const body = await request.json() as { rows: RawImportRow[] };
  const rows: RawImportRow[] = body.rows ?? [];

  // Fetch full service catalog once for fuzzy matching
  const catalog = await db.select().from(schema.serviceCatalog);

  // Fetch user's categories + system categories (userId is null for system)
  const userCategories = await db.query.categories.findMany({
    where: or(
      eq(schema.categories.userId, session.user.id),
      isNull(schema.categories.userId),
    ),
  });

  const previewRows: CsvImportPreviewRow[] = rows.map((row, rowIndex) => {
    const parsed = csvImportRowSchema.safeParse(row);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "unknown",
        message: issue.message,
      }));
      return {
        rowIndex,
        name: row.name ?? "",
        price: row.price ?? "",
        currency: row.currency ?? "USD",
        billingCycle: row.billingCycle ?? "",
        nextRenewalDate: row.nextRenewalDate ?? "",
        startDate: row.startDate ?? null,
        categoryName: row.categoryName ?? null,
        matchedService: null,
        matchConfidence: "none",
        resolvedCategoryId: null,
        isValid: false,
        errors,
      };
    }

    const data = parsed.data;

    // Fuzzy match service name against catalog
    const match = fuzzyMatchService(
      data.name,
      catalog.map((c) => ({ id: c.id, name: c.name })),
    );

    const matchedService =
      match.matchId !== null
        ? (() => {
            const found = catalog.find((c) => c.id === match.matchId)!;
            return {
              id: found.id,
              name: found.name,
              logoUrl: found.logoUrl,
              websiteUrl: found.websiteUrl,
              defaultCategory: found.defaultCategory,
            };
          })()
        : null;

    // Resolve categoryName → categoryId
    let resolvedCategoryId: number | null = null;
    if (data.categoryName) {
      const categoryNorm = data.categoryName.toLowerCase().trim();
      const found = userCategories.find(
        (c) => c.name.toLowerCase().trim() === categoryNorm,
      );
      resolvedCategoryId = found?.id ?? null;
    }

    return {
      rowIndex,
      name: data.name,
      price: data.price,
      currency: data.currency,
      billingCycle: data.billingCycle,
      nextRenewalDate: data.nextRenewalDate,
      startDate: data.startDate ?? null,
      categoryName: data.categoryName ?? null,
      matchedService,
      matchConfidence: match.confidence,
      resolvedCategoryId,
      isValid: true,
      errors: [],
    };
  });

  return Response.json({ rows: previewRows });
}
