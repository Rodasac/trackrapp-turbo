"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { Button } from "@repo/ui/button";
import { useIsPro } from "@/hooks/use-subscription-plan";

export function CsvImportButton() {
  const isPro = useIsPro();

  if (!isPro) return null;

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/subscriptions/import">
        <Upload className="mr-2 size-4" />
        Import CSV
      </Link>
    </Button>
  );
}
