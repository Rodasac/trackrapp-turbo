"use client";

import { FadeIn } from "@/components/landing/motion/fade-in";
import { AnimatedCounter } from "@/components/landing/motion/animated-counter";

const STATS = [
  {
    to: 10000,
    suffix: "+",
    label: "Subscriptions tracked",
    description: "Across all users worldwide",
  },
  {
    to: 50000,
    prefix: "$",
    suffix: "+",
    label: "Saved by users",
    description: "Through AI tips and insights",
  },
  {
    to: 99.9,
    suffix: "%",
    label: "Uptime",
    description: "Reliable, always-on service",
    decimals: 1,
  },
  {
    to: 4.9,
    suffix: "/5",
    label: "User rating",
    description: "Based on user feedback",
    decimals: 1,
  },
];

export function StatsSection() {
  return (
    <section className="bg-brand/5 border-y border-brand/10 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ to, prefix, suffix, label, description, decimals }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-bold text-brand">
                <AnimatedCounter
                  to={to}
                  prefix={prefix}
                  suffix={suffix}
                  decimals={decimals}
                />
              </p>
              <p className="mt-1 font-semibold">{label}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
