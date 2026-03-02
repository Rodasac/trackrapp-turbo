"use client";

import Link from "next/link";
import { Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { useAiTips } from "@/hooks/use-ai-tips";
import { AiTipCard } from "@/components/ai-tip-card";
import { StaticTipsList } from "@/components/static-tips-list";

function TipCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-5 w-20 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
      </div>
      <div className="h-3 w-28 rounded bg-muted mt-auto pt-1" />
    </div>
  );
}

export default function TipsPage() {
  const { data: plan, isLoading: planLoading } = useSubscriptionPlan();
  const isPro =
    plan?.plan === "pro" &&
    (plan.status === "active" || plan.status === "trialing");

  const { data: tips, isLoading: tipsLoading } = useAiTips({
    enabled: isPro,
  });

  const isLoading = planLoading || (isPro && tipsLoading);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-brand" />
            <h1 className="text-2xl font-semibold">AI Insights</h1>
            <Badge variant="secondary">Pro</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isPro
              ? "Refreshed weekly based on your subscription portfolio"
              : "AI-powered insights based on your spending"}
          </p>
        </div>
        {!isPro && !planLoading && (
          <Button asChild variant="outline">
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <TipCardSkeleton key={i} />
          ))}
        </div>
      ) : isPro ? (
        tips && tips.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip, i) => (
              <AiTipCard key={tip.id} tip={tip} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground rounded-lg border border-dashed py-24 text-center text-sm">
            <Lightbulb className="mx-auto mb-3 size-8 opacity-40" />
            <p className="font-medium">No tips yet</p>
            <p className="mt-1">
              AI tips are generated weekly once you have subscriptions tracked.
            </p>
          </div>
        )
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed py-24 text-center text-sm">
          <Lightbulb className="mx-auto mb-3 size-8 opacity-40" />
          <p className="font-medium">AI tips are a Pro feature</p>
          <p className="mt-1">
            Upgrade to get personalized spending insights and recommendations.
          </p>
          <Button asChild className="mt-4">
            <Link href="/pricing">View plans</Link>
          </Button>
        </div>
      )}

      <section className="mt-8">
        <StaticTipsList />
      </section>
    </div>
  );
}
