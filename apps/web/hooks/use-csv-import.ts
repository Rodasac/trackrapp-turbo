"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type {
  CsvImportPreviewResponse,
  CsvImportResult,
} from "@/lib/types/api";

interface RawImportRow {
  name: string;
  price: string;
  currency?: string;
  billingCycle: string;
  nextRenewalDate: string;
  startDate?: string | null;
  categoryName?: string | null;
}

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

/** Request preview of mapped CSV rows — fuzzy matches services and validates. */
export function usePreviewCsvImport() {
  return useMutation({
    mutationFn: async (
      rows: RawImportRow[],
    ): Promise<CsvImportPreviewResponse> => {
      const res = await fetch("/api/subscriptions/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Preview failed");
      }
      return res.json();
    },
  });
}

/** Confirm and bulk-import selected rows. Invalidates subscriptions + dashboard on success. */
export function useConfirmCsvImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      rows: ConfirmedImportRow[],
    ): Promise<CsvImportResult> => {
      const res = await fetch("/api/subscriptions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Import failed");
      }
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.charts });
    },
  });
}
