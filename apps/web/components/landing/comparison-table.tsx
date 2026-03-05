"use client";

import { Link } from "@/i18n/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { FadeIn } from "@/components/landing/motion/fade-in";
import { COMPARISON_FEATURES } from "@/lib/comparison-data";
import { useTranslations } from "next-intl";

function CheckIcon({ label }: { label: string }) {
  return (
    <Check
      data-testid="check-icon"
      className="mx-auto size-4 text-emerald-500"
      aria-label={label}
    />
  );
}

function CrossIcon({ label }: { label: string }) {
  return (
    <X
      data-testid="cross-icon"
      className="mx-auto size-4 text-muted-foreground/40"
      aria-label={label}
    />
  );
}

export function ComparisonTable() {
  const t = useTranslations("landing.comparison");

  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("sectionTitle")}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            {t("sectionDescription")}
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-hidden rounded-2xl border bg-card">
            {/* Header */}
            <div className="grid grid-cols-3 border-b bg-muted/30 px-6 py-4">
              <div className="text-sm font-medium text-muted-foreground">
                {t("featureHeader")}
              </div>
              <div className="text-center text-sm font-semibold">
                {t("freeHeader")}
              </div>
              <div className="text-center text-sm font-semibold text-brand">
                {t("proHeader")}
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
                  {free ? (
                    <CheckIcon label={t("included")} />
                  ) : (
                    <CrossIcon label={t("notIncluded")} />
                  )}
                </div>
                <div className="text-center">
                  {pro ? (
                    <CheckIcon label={t("included")} />
                  ) : (
                    <CrossIcon label={t("notIncluded")} />
                  )}
                </div>
              </div>
            ))}

            {/* CTA footer */}
            <div className="grid grid-cols-3 items-center gap-4 border-t bg-muted/30 px-6 py-4">
              <div />
              <Button variant="outline" size="sm" asChild>
                <Link href="/signup">{t("getStartedFree")}</Link>
              </Button>
              <Button size="sm" className="bg-brand hover:bg-brand/90" asChild>
                <Link href="/signup?plan=pro">{t("startTrial")}</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
