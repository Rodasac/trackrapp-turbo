"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import {
  usePreviewCsvImport,
  useConfirmCsvImport,
} from "@/hooks/use-csv-import";
import type { CsvImportPreviewRow } from "@/lib/types/api";
import type { MappedRow } from "./mapping-step";
import { cn } from "@repo/ui/lib/utils";

interface PreviewStepProps {
  mappedRows: MappedRow[];
  onSuccess: () => void;
}

function MatchBadge({
  confidence,
}: {
  confidence: CsvImportPreviewRow["matchConfidence"];
}) {
  if (confidence === "exact")
    return (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
        Exact
      </Badge>
    );
  if (confidence === "fuzzy")
    return (
      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
        Fuzzy
      </Badge>
    );
  return <Badge variant="secondary">None</Badge>;
}

export function PreviewStep({ mappedRows, onSuccess }: PreviewStepProps) {
  const router = useRouter();
  const preview = usePreviewCsvImport();
  const confirm = useConfirmCsvImport();

  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    preview.mutate(mappedRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = preview.data?.rows ?? [];
  const validRows = rows.filter((r) => r.isValid);

  const allSelected =
    validRows.length > 0 && validRows.every((r) => selected.has(r.rowIndex));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(validRows.map((r) => r.rowIndex)));
    }
  }

  function toggleRow(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  async function handleImport() {
    const toImport = rows
      .filter((r) => r.isValid && selected.has(r.rowIndex))
      .map((r) => ({
        name: r.name,
        price: r.price,
        currency: r.currency,
        billingCycle: r.billingCycle as
          | "monthly"
          | "yearly"
          | "weekly"
          | "quarterly",
        nextRenewalDate: r.nextRenewalDate,
        startDate: r.startDate ?? null,
        categoryId: r.resolvedCategoryId ?? null,
        serviceCatalogId: r.matchedService?.id ?? null,
        logoUrl: r.matchedService?.logoUrl ?? null,
        websiteUrl: r.matchedService?.websiteUrl ?? null,
      }));

    try {
      const result = await confirm.mutateAsync(toImport);
      toast.success(
        `Imported ${result.imported} subscription${result.imported !== 1 ? "s" : ""}`,
      );
      if (result.failed > 0) {
        toast.warning(
          `${result.failed} row${result.failed !== 1 ? "s" : ""} failed to import`,
        );
      }
      onSuccess();
      router.push("/subscriptions");
    } catch {
      toast.error("Import failed. Please try again.");
    }
  }

  if (preview.isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (preview.error) {
    return (
      <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Failed to preview rows. Please go back and check your CSV.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {validRows.length} valid · {rows.length - validRows.length} errors ·{" "}
          {selected.size} selected
        </span>
        <Button
          onClick={handleImport}
          disabled={selected.size === 0 || confirm.isPending}
        >
          {confirm.isPending
            ? "Importing…"
            : `Import ${selected.size} Selected`}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="w-10 px-3 py-2 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all valid rows"
                />
              </th>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Price</th>
              <th className="px-3 py-2 text-left font-medium">Cycle</th>
              <th className="px-3 py-2 text-left font-medium">Renewal</th>
              <th className="px-3 py-2 text-left font-medium">Category</th>
              <th className="px-3 py-2 text-left font-medium">Match</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.rowIndex}
                className={cn(
                  "border-b last:border-0",
                  !row.isValid && "opacity-50",
                )}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(row.rowIndex)}
                    onChange={() => toggleRow(row.rowIndex)}
                    disabled={!row.isValid}
                    aria-label={`Select row ${row.rowIndex + 1}`}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{row.name}</span>
                    {row.errors.map((e, i) => (
                      <span key={i} className="text-xs text-destructive">
                        {e.message}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {row.currency} {row.price}
                </td>
                <td className="px-3 py-2 capitalize">{row.billingCycle}</td>
                <td className="px-3 py-2 tabular-nums">
                  {row.nextRenewalDate}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {row.categoryName ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <MatchBadge confidence={row.matchConfidence} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
