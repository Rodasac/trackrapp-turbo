"use client";

import { Upload, Bell, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import { FadeIn } from "@/components/landing/motion/fade-in";
import {
  StaggerChildren,
  itemVariants,
} from "@/components/landing/motion/stagger-children";
import { useTranslations } from "next-intl";

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  const STEPS = [
    {
      number: "1",
      icon: Upload,
      title: t("step1Title"),
      description: t("step1Desc"),
    },
    {
      number: "2",
      icon: Bell,
      title: t("step2Title"),
      description: t("step2Desc"),
    },
    {
      number: "3",
      icon: TrendingDown,
      title: t("step3Title"),
      description: t("step3Desc"),
    },
  ];

  return (
    <section id="how-it-works" className="bg-muted/20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("sectionTitle")}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            {t("sectionDescription")}
          </p>
        </FadeIn>

        <StaggerChildren className="relative grid gap-10 sm:grid-cols-3">
          {/* Connecting line (desktop) */}
          <div
            className="absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block"
            aria-hidden
          />

          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <motion.div
              key={number}
              variants={itemVariants}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step badge */}
              <div className="relative mb-6 flex size-16 items-center justify-center rounded-2xl bg-brand text-brand-foreground font-bold text-xl shadow-lg shadow-brand/25">
                <Icon className="size-7" />
                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-background border border-border text-xs font-bold text-foreground">
                  {number}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                {description}
              </p>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
