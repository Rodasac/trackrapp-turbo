"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  detectColumnMapping,
  type TrackrField,
} from "@repo/shared/column-detect";
import { cn } from "@repo/ui/lib/utils";
import { ImportDefaultsPanel } from "./import-defaults";

// name + price must always come from a CSV column
const ALWAYS_REQUIRED: TrackrField[] = ["name", "price"];

// billingCycle + nextRenewalDate can be satisfied by CSV column OR a default value
const DEFAULTABLE_REQUIRED: TrackrField[] = ["billingCycle", "nextRenewalDate"];

export interface ImportDefaults {
  billingCycle: string;
  nextRenewalDate: string;
  currency: string;
  categoryName: string;
  startDate: string;
}

export interface MappedRow {
  name: string;
  price: string;
  currency?: string;
  billingCycle: string;
  nextRenewalDate: string;
  startDate?: string | null;
  categoryName?: string | null;
}

interface MappingStepProps {
  headers: string[];
  rows: string[][];
  onContinue: (mappedRows: MappedRow[]) => void;
  defaultCurrency?: string;
}

export function MappingStep({
  headers,
  rows,
  onContinue,
  defaultCurrency,
}: MappingStepProps) {
  const t = useTranslations("csvImport.mapping");

  const TRACKR_FIELDS: {
    value: TrackrField;
    label: string;
    required: boolean;
  }[] = [
    { value: "name", label: t("fieldName"), required: true },
    { value: "price", label: t("fieldPrice"), required: true },
    { value: "currency", label: t("fieldCurrency"), required: false },
    { value: "billingCycle", label: t("fieldBillingCycle"), required: true },
    { value: "nextRenewalDate", label: t("fieldNextRenewal"), required: true },
    { value: "categoryName", label: t("fieldCategory"), required: false },
    { value: "startDate", label: t("fieldStartDate"), required: false },
    { value: "status", label: t("fieldStatus"), required: false },
  ];

  const autoDetected = detectColumnMapping(headers);

  const [mapping, setMapping] = useState<Record<string, TrackrField | null>>(
    () => autoDetected,
  );

  const [defaults, setDefaults] = useState<ImportDefaults>({
    billingCycle: "monthly",
    nextRenewalDate: new Date().toISOString().split("T")[0] ?? "",
    currency: defaultCurrency ?? "USD",
    categoryName: "",
    startDate: "",
  });

  const mappedValues = Object.values(mapping).filter((v) => v !== null);
  const mappedCount = mappedValues.length;

  const alwaysMapped = ALWAYS_REQUIRED.every((f) => mappedValues.includes(f));
  const defaultableOk = DEFAULTABLE_REQUIRED.every(
    (f) =>
      mappedValues.includes(f) || defaults[f as keyof ImportDefaults] !== "",
  );
  const canContinue = alwaysMapped && defaultableOk;

  const previewRows = rows.slice(0, 3);

  function handleContinue() {
    // Reverse the mapping: TrackrField → column index
    const fieldToIdx: Partial<Record<TrackrField, number>> = {};
    headers.forEach((h, idx) => {
      const field = mapping[h];
      if (field) fieldToIdx[field] = idx;
    });

    const mapped: MappedRow[] = rows.map((row) => ({
      name: row[fieldToIdx["name"] ?? -1] ?? "",
      price: row[fieldToIdx["price"] ?? -1] ?? "",
      // CSV value wins; fall back to default if cell is absent/empty
      currency:
        row[fieldToIdx["currency"] ?? -1] || defaults.currency || undefined,
      billingCycle:
        (row[fieldToIdx["billingCycle"] ?? -1] || defaults.billingCycle) ?? "",
      nextRenewalDate:
        (row[fieldToIdx["nextRenewalDate"] ?? -1] ||
          defaults.nextRenewalDate) ??
        "",
      startDate:
        (fieldToIdx["startDate"] !== undefined
          ? (row[fieldToIdx["startDate"]] ?? null)
          : null) ||
        defaults.startDate ||
        undefined,
      categoryName:
        (fieldToIdx["categoryName"] !== undefined
          ? (row[fieldToIdx["categoryName"]] ?? null)
          : null) ||
        defaults.categoryName ||
        undefined,
    }));

    onContinue(mapped);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Info alert */}
      <div className="rounded-md border bg-yellow-50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-yellow-500" />
          <p className="text-sm text-yellow-700">
            <strong>{t("tipHeading")}</strong> {t("tip")}
          </p>
        </div>
      </div>

      {/* Defaults panel */}
      <ImportDefaultsPanel defaults={defaults} onChange={setDefaults} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t("instruction")}</p>
        <span
          className={cn(
            "text-sm font-medium",
            canContinue ? "text-green-600" : "text-amber-600",
          )}
        >
          {t("columnsMapped", { mapped: mappedCount, total: headers.length })}
        </span>
      </div>

      {/* Mapping table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-2 text-left font-medium">
                {t("csvColumn")}
              </th>
              <th className="px-4 py-2 text-left font-medium">{t("mapsTo")}</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header) => {
              const isAutoDetected = autoDetected[header] !== null;
              return (
                <tr key={header} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {isAutoDetected && (
                        <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                      )}
                      <span className="font-mono text-xs">{header}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Select
                      value={mapping[header] ?? "__skip__"}
                      onValueChange={(val) =>
                        setMapping((prev) => ({
                          ...prev,
                          [header]:
                            val === "__skip__" ? null : (val as TrackrField),
                        }))
                      }
                    >
                      <SelectTrigger className="h-8 w-48 text-xs">
                        <SelectValue placeholder={t("skipColumn")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__skip__">
                          {t("skipColumn")}
                        </SelectItem>
                        {TRACKR_FIELDS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                            {f.required && " *"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Data preview */}
      {previewRows.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            Preview (first {previewRows.length} row
            {previewRows.length > 1 ? "s" : ""})
          </p>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-1.5 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, ri) => (
                  <tr key={ri} className="border-b last:border-0">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-1.5 text-muted-foreground"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleContinue} disabled={!canContinue}>
          {t("continueButton")}
        </Button>
      </div>
    </div>
  );
}
