"use client";

import { Star } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@repo/ui/lib/utils";
import { FadeIn } from "@/components/landing/motion/fade-in";
import {
  StaggerChildren,
  itemVariants,
} from "@/components/landing/motion/stagger-children";
import { PRICING } from "@/lib/pricing-config";
import { useTranslations } from "next-intl";

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Freelance Designer",
    initials: "SM",
    quote: `I had no idea I was paying for 4 tools that basically did the same thing. TrackrApp's AI tips flagged it in the first week and saved me $${PRICING.pro.annual}/month.`,
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "James T.",
    role: "Small Business Owner",
    initials: "JT",
    quote:
      "The renewal reminders alone are worth it. I used to dread checking my bank statement at the end of the month. Now I'm always ahead of it.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    name: "Priya K.",
    role: "Software Engineer",
    initials: "PK",
    quote: `Clean UI, dark mode, and it just works. The CSV import handled my messy spreadsheet perfectly. Honestly the best $${PRICING.pro.monthly}/month I spend.`,
    color: "from-cyan-500 to-emerald-500",
  },
];

export function Testimonials() {
  const t = useTranslations("landing.testimonials");

  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("sectionTitle")}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            {t("sectionDescription")}
          </p>
        </FadeIn>

        <StaggerChildren className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map(({ name, role, initials, quote, color }) => (
            <motion.blockquote
              key={name}
              variants={itemVariants}
              role="blockquote"
              className={cn(
                "relative rounded-2xl border bg-card p-6",
                "hover:border-brand/20 hover:shadow-md transition-all duration-300",
              )}
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-foreground/80 mb-6">
                &ldquo;{quote}&rdquo;
              </p>

              <footer className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shrink-0",
                    color,
                  )}
                  aria-hidden
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-muted-foreground text-xs">{role}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
