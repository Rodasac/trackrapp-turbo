"use client";

import { Check } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

const STEPS = [
  { number: 1, label: "Upload" },
  { number: 2, label: "Map Columns" },
  { number: 3, label: "Preview & Import" },
] as const;

interface ImportStepperProps {
  currentStep: 1 | 2 | 3;
}

export function ImportStepper({ currentStep }: ImportStepperProps) {
  return (
    <nav aria-label="Import steps" className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        return (
          <div key={step.number} className="flex items-center">
            <div
              data-testid={`step-${step.number}`}
              data-active={isActive}
              data-completed={isCompleted}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isCompleted &&
                    "border-brand bg-brand text-white",
                  isActive &&
                    "border-brand text-brand",
                  !isCompleted && !isActive &&
                    "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="size-4" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "text-brand",
                  isCompleted && "text-muted-foreground",
                  !isCompleted && !isActive && "text-muted-foreground/50",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-3 mb-5 h-px w-16 transition-colors",
                  step.number < currentStep ? "bg-brand" : "bg-muted-foreground/20",
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
