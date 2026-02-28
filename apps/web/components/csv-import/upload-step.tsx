"use client";

import { useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { parseCsv, type ParsedCsv } from "@repo/shared/csv";
import { cn } from "@repo/ui/lib/utils";

const MAX_BYTES = 1024 * 1024; // 1 MB

interface UploadStepProps {
  onParsed: (parsed: ParsedCsv) => void;
}

export function UploadStep({ onParsed }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function processFile(file: File) {
    setError(null);

    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setError("CSV files only. Please upload a .csv file.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError(
        "File exceeds 1MB limit. Please split the file and import in batches.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCsv(text);
        if (parsed.headers.length === 0) {
          setError("The file appears to be empty or has no headers.");
          return;
        }
        onParsed(parsed);
      } catch {
        setError("Failed to parse CSV. Please check the file format.");
      }
    };
    reader.readAsText(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full max-w-lg cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed px-8 py-16 transition-colors",
          isDragging
            ? "border-brand bg-brand/5"
            : "border-muted-foreground/30 hover:border-brand/60 hover:bg-muted/30",
        )}
      >
        <FileUp className="size-12 text-muted-foreground" />
        <div className="text-center">
          <p className="text-base font-medium">
            Drag & drop your CSV file here
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or{" "}
            <span className="text-brand underline underline-offset-2">
              click to browse
            </span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Max 1 MB · .csv only</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          data-testid="csv-file-input"
          onChange={handleChange}
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
