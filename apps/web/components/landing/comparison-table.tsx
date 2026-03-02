"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { FadeIn } from "@/components/landing/motion/fade-in";
import { COMPARISON_FEATURES } from "@/lib/comparison-data";

function CheckIcon() {
  return (
    <Check
      data-testid="check-icon"
      className="mx-auto size-4 text-emerald-500"
      aria-label="Included"
    />
  );
}

function CrossIcon() {
  return (
    <X
      data-testid="cross-icon"
      className="mx-auto size-4 text-muted-foreground/40"
      aria-label="Not included"
    />
  );
}

export function ComparisonTable() {
  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Compare plans
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            Everything in Free, plus powerful Pro features.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-hidden rounded-2xl border bg-card">
            {/* Header */}
            <div className="grid grid-cols-3 border-b bg-muted/30 px-6 py-4">
              <div className="text-sm font-medium text-muted-foreground">
                Feature
              </div>
              <div className="text-center text-sm font-semibold">Free</div>
              <div className="text-center text-sm font-semibold text-brand">
                Pro
              </div>
            </div>

            {/* Rows */}
            {COMPARISON_FEATURES.map(({ feature, free, pro }, i) => (
              <div
                key={feature}
                className={cn(
                  "grid grid-cols-3 items-center px-6 py-3.5",
                  i !== COMPARISON_FEATURES.length - 1 && "border-b",
                  i % 2 === 0 ? "bg-card" : "bg-muted/20",
                )}
              >
                <span className="text-sm">{feature}</span>
                <div className="text-center">
                  {free ? <CheckIcon /> : <CrossIcon />}
                </div>
                <div className="text-center">
                  {pro ? <CheckIcon /> : <CrossIcon />}
                </div>
              </div>
            ))}

            {/* CTA footer */}
            <div className="grid grid-cols-3 items-center gap-4 border-t bg-muted/30 px-6 py-4">
              <div />
              <Button variant="outline" size="sm" asChild>
                <Link href="/signup">Get started free</Link>
              </Button>
              <Button size="sm" className="bg-brand hover:bg-brand/90" asChild>
                <Link href="/signup">Start free trial</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
