"use client";

import { FadeIn } from "@/components/landing/motion/fade-in";
import { AnimatedCounter } from "@/components/landing/motion/animated-counter";
import { usePlatformStats } from "@/hooks/use-platform-stats";

export function StatsSection() {
  const { data } = usePlatformStats();

  const stats = [
    {
      to: data?.totalSubscriptions ?? 0,
      suffix: "+",
      label: "Subscriptions tracked",
      description: "Across all users worldwide",
    },
    {
      to: data?.totalUsers ?? 0,
      suffix: "+",
      label: "Users signed up",
      description: "And growing every day",
    },
    {
      to: data?.totalReminders ?? 0,
      suffix: "+",
      label: "Reminders sent",
      description: "Never miss a renewal again",
    },
    {
      to: Number(data?.totalSaved ?? 0),
      prefix: "$",
      suffix: "+",
      label: "Saved by users",
      description: "Through cancelling unused subs",
    },
  ];

  return (
    <section className="bg-brand/5 border-y border-brand/10 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ to, prefix, suffix, label, description }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-bold text-brand">
                <AnimatedCounter to={to} prefix={prefix} suffix={suffix} />
              </p>
              <p className="mt-1 font-semibold">{label}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {description}
              </p>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
