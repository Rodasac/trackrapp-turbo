"use client";

import {
  Bell,
  BarChart3,
  Sparkles,
  FileSpreadsheet,
  CalendarDays,
  Moon,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@repo/ui/lib/utils";
import { FadeIn } from "@/components/landing/motion/fade-in";
import { StaggerChildren, itemVariants } from "@/components/landing/motion/stagger-children";

const FEATURES = [
  {
    icon: Bell,
    title: "Renewal Reminders",
    description:
      "Get email and push notifications before renewals so you're never caught off guard.",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: BarChart3,
    title: "Spending Analytics",
    description:
      "Visualise where your money goes with trend charts, category breakdowns, and top services.",
    color: "from-teal-500/20 to-cyan-500/20",
    iconColor: "text-teal-400",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Tips",
    description:
      "Receive personalised recommendations to cut costs and optimise your subscription stack.",
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: FileSpreadsheet,
    title: "CSV Import & Export",
    description:
      "Bring in existing data from spreadsheets and export reports in one click.",
    color: "from-teal-500/20 to-emerald-500/20",
    iconColor: "text-teal-400",
  },
  {
    icon: CalendarDays,
    title: "Calendar View",
    description:
      "See all upcoming renewals at a glance on an interactive monthly calendar.",
    color: "from-cyan-500/20 to-teal-500/20",
    iconColor: "text-cyan-400",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description:
      "A beautiful dark theme that's easy on the eyes, day or night.",
    color: "from-slate-500/20 to-gray-500/20",
    iconColor: "text-slate-400",
  },
];

export function FeatureCards() {
  return (
    <section id="features" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            One app to track, analyse, and take control of all your
            subscriptions.
          </p>
        </FadeIn>

        <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, color, iconColor }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              className={cn(
                "group relative rounded-2xl border bg-card p-6",
                "hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5",
                "transition-all duration-300",
              )}
            >
              <div
                className={cn(
                  "mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br",
                  color,
                )}
              >
                <Icon className={cn("size-6", iconColor)} />
              </div>
              <h3 className="mb-2 font-semibold">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
