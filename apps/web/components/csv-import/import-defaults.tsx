"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { useTranslations } from "next-intl";
import { useCategories } from "@/hooks/use-categories";
import type { ImportDefaults } from "./mapping-step";
import { CURRENCIES } from "@repo/shared/constants";

interface ImportDefaultsPanelProps {
  defaults: ImportDefaults;
  onChange: (d: ImportDefaults) => void;
}

export function ImportDefaultsPanel({
  defaults,
  onChange,
}: ImportDefaultsPanelProps) {
  const t = useTranslations("csvImport.defaults");
  const { data: categories = [] } = useCategories();

  const BILLING_CYCLES = [
    { value: "monthly", label: t("monthly") },
    { value: "yearly", label: t("yearly") },
    { value: "weekly", label: t("weekly") },
    { value: "quarterly", label: t("quarterly") },
  ];

  function set<K extends keyof ImportDefaults>(
    key: K,
    value: ImportDefaults[K],
  ) {
    onChange({ ...defaults, [key]: value });
  }

  return (
    <details className="rounded-md border bg-muted/30 p-4">
      <summary className="cursor-pointer select-none text-sm font-medium">
        {t("title")}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          {t("subtitle")}
        </span>
      </summary>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Billing Cycle */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="default-billing-cycle"
            className="text-xs font-medium"
          >
            {t("billingCycleLabel")}
          </label>
          <Select
            value={defaults.billingCycle}
            onValueChange={(v) => set("billingCycle", v)}
          >
            <SelectTrigger id="default-billing-cycle" className="h-8 text-xs">
              <SelectValue placeholder={t("selectPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {BILLING_CYCLES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Currency */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="default-currency" className="text-xs font-medium">
            {t("currencyLabel")}
          </label>
          <Select
            value={defaults.currency}
            onValueChange={(v) => set("currency", v)}
          >
            <SelectTrigger id="default-currency" className="h-8 text-xs">
              <SelectValue placeholder={t("selectPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="default-category" className="text-xs font-medium">
            {t("categoryLabel")}
          </label>
          <Select
            value={defaults.categoryName || "__none__"}
            onValueChange={(v) =>
              set("categoryName", v === "__none__" ? "" : v)
            }
          >
            <SelectTrigger id="default-category" className="h-8 text-xs">
              <SelectValue placeholder={t("none")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t("none")}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Next Renewal Date */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="default-next-renewal-date"
            className="text-xs font-medium"
          >
            {t("nextRenewalLabel")}
          </label>
          <input
            id="default-next-renewal-date"
            type="date"
            value={defaults.nextRenewalDate}
            onChange={(e) => set("nextRenewalDate", e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Start Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="default-start-date" className="text-xs font-medium">
            {t("startDateLabel")}
          </label>
          <input
            id="default-start-date"
            type="date"
            value={defaults.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </details>
  );
}
