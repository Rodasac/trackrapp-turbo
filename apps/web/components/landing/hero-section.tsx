"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@repo/ui/button";
import { FadeIn } from "@/components/landing/motion/fade-in";
import { AppMockup } from "@/components/landing/app-mockup";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32 lg:py-40">
      {/* Gradient orbs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.696 0.17 162.48), transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 -bottom-40 size-[500px] rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.720 0.160 180), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Left: copy */}
          <FadeIn className="flex-1 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("headline")}
            </div>
            <h1 className="font-display text-5xl font-normal leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              {t("track")} <span className="text-emerald-400">{t("subscriptionHighlight")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/60 lg:mx-0">
              {t("description")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Link href="/signup">{t("startFree")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 text-white/80 hover:bg-white/5 hover:text-white bg-transparent"
              >
                <Link href="#pricing">{t("seePricing")}</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-white/30">
              {t("noCardRequired")}
            </p>
          </FadeIn>

          {/* Right: App mockup */}
          <FadeIn delay={0.2} className="flex-1 flex justify-center">
            <AppMockup className="animate-float" />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
