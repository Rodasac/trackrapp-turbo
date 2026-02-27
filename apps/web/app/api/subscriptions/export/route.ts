import { db, schema } from "@repo/database";
import { requireSession } from "@/lib/api/helpers";
import { generateCsv } from "@repo/shared/csv";
import { eq } from "drizzle-orm";

const HEADERS = [
  "Name",
  "Price",
  "Currency",
  "Billing Cycle",
  "Next Renewal",
  "Category",
  "Status",
  "Start Date",
];

export async function GET(request: Request) {
  const result = await requireSession(request);
  if ("error" in result) return result.error;
  const { session } = result;

  const subs = await db.query.trackedSubscriptions.findMany({
    where: eq(schema.trackedSubscriptions.userId, session.user.id),
    with: { category: true },
    orderBy: (t, { asc }) => [asc(t.nextRenewalDate)],
  });

  const rows = subs.map((sub) => [
    sub.name,
    sub.price,
    sub.currency,
    sub.billingCycle,
    sub.nextRenewalDate,
    sub.category?.name ?? "",
    sub.isActive ? "Active" : "Inactive",
    sub.startDate ?? "",
  ]);

  const csv = generateCsv(HEADERS, rows);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="subscriptions.csv"',
    },
  });
}
