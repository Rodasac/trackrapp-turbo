"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { Button } from "@repo/ui/button";

export function CsvImportButton() {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/subscriptions/import">
        <Upload className="mr-2 size-4" />
        Import CSV
      </Link>
    </Button>
  );
}
