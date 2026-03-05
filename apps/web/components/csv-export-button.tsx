"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@repo/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function CsvExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const t = useTranslations("subscriptions.csvExport");

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await fetch("/api/subscriptions/export");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subscriptions.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(t("downloadedToast"));
    } catch {
      toast.error(t("failedToast"));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      data-testid="csv-export-button"
    >
      <Download className="mr-2 size-4" />
      {isExporting ? t("exporting") : t("button")}
    </Button>
  );
}
