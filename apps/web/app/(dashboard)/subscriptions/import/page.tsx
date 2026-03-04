"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ImportStepper } from "@/components/csv-import/import-stepper";
import { UploadStep } from "@/components/csv-import/upload-step";
import {
  MappingStep,
  type MappedRow,
} from "@/components/csv-import/mapping-step";
import { PreviewStep } from "@/components/csv-import/preview-step";
import { ProFeatureGate } from "@/components/pro-feature-gate";
import { useIsPro } from "@/hooks/use-subscription-plan";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import type { ParsedCsv } from "@repo/shared/csv";

type Step = 1 | 2 | 3;

export default function ImportPage() {
  const isPro = useIsPro();
  const { data: userPrefs } = useUserPreferences();
  const [step, setStep] = useState<Step>(1);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mappedRows, setMappedRows] = useState<MappedRow[]>([]);

  function handleParsed(data: ParsedCsv) {
    setParsed(data);
    setStep(2);
  }

  function handleMapped(rows: MappedRow[]) {
    setMappedRows(rows);
    setStep(3);
  }

  if (isPro === false) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <ProFeatureGate
          feature="CSV Import"
          description="Import your subscriptions in bulk from a CSV file. Upgrade to Pro to unlock this feature."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/subscriptions">
            <ArrowLeft className="mr-1 size-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Import Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file to bulk-add your subscriptions
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-10">
        <ImportStepper currentStep={step} />
      </div>

      {/* Step content */}
      {step === 1 && <UploadStep onParsed={handleParsed} />}

      {step === 2 && parsed && (
        <MappingStep
          headers={parsed.headers}
          rows={parsed.rows}
          onContinue={handleMapped}
          defaultCurrency={userPrefs?.defaultCurrency}
        />
      )}

      {step === 3 && (
        <PreviewStep
          mappedRows={mappedRows}
          onSuccess={() => {
            // redirect handled inside PreviewStep after confirm
          }}
        />
      )}
    </div>
  );
}
