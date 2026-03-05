"use client";

import { FadeIn } from "@/components/landing/motion/fade-in";
import { PricingCards } from "@/components/landing/pricing-cards";
import { useTranslations } from "next-intl";

export function PricingSection() {
  const t = useTranslations("landing.pricingSection");

  return (
    <section id="pricing" className="bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("sectionTitle")}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t("sectionDescription")}
          </p>
          <PricingCards />
        </FadeIn>
      </div>
    </section>
  );
}
