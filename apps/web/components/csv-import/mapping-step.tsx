"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
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

const TRACKR_FIELDS: { value: TrackrField; label: string; required: boolean }[] = [
  { value: "name", label: "Name", required: true },
  { value: "price", label: "Price", required: true },
  { value: "currency", label: "Currency", required: false },
  { value: "billingCycle", label: "Billing Cycle", required: true },
  { value: "nextRenewalDate", label: "Next Renewal Date", required: true },
  { value: "categoryName", label: "Category", required: false },
  { value: "startDate", label: "Start Date", required: false },
  { value: "status", label: "Status", required: false },
];

const REQUIRED_FIELDS: TrackrField[] = ["name", "price", "billingCycle", "nextRenewalDate"];

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
}

export function MappingStep({ headers, rows, onContinue }: MappingStepProps) {
  const autoDetected = detectColumnMapping(headers);

  const [mapping, setMapping] = useState<Record<string, TrackrField | null>>(
    () => autoDetected,
  );

  const mappedCount = Object.values(mapping).filter((v) => v !== null).length;
  const requiredMapped = REQUIRED_FIELDS.every((f) =>
    Object.values(mapping).includes(f),
  );

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
      currency: row[fieldToIdx["currency"] ?? -1] ?? undefined,
      billingCycle: row[fieldToIdx["billingCycle"] ?? -1] ?? "",
      nextRenewalDate: row[fieldToIdx["nextRenewalDate"] ?? -1] ?? "",
      startDate: fieldToIdx["startDate"] !== undefined ? (row[fieldToIdx["startDate"]] ?? null) : null,
      categoryName: fieldToIdx["categoryName"] !== undefined ? (row[fieldToIdx["categoryName"]] ?? null) : null,
    }));

    onContinue(mapped);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Map your CSV columns to TrackrApp fields.
        </p>
        <span
          className={cn(
            "text-sm font-medium",
            requiredMapped ? "text-green-600" : "text-amber-600",
          )}
        >
          {mappedCount} of {headers.length} columns mapped
        </span>
      </div>

      {/* Mapping table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-2 text-left font-medium">CSV Column</th>
              <th className="px-4 py-2 text-left font-medium">Maps To</th>
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
                          [header]: val === "__skip__" ? null : (val as TrackrField),
                        }))
                      }
                    >
                      <SelectTrigger className="h-8 w-48 text-xs">
                        <SelectValue placeholder="Skip this column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__skip__">Skip this column</SelectItem>
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
            Preview (first {previewRows.length} row{previewRows.length > 1 ? "s" : ""})
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
                      <td key={ci} className="px-3 py-1.5 text-muted-foreground">
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
        <Button onClick={handleContinue} disabled={!requiredMapped}>
          Continue to Preview
        </Button>
      </div>
    </div>
  );
}
