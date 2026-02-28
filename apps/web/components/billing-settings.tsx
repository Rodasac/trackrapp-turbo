"use client";

import { toast } from "sonner";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import {
  useUpgradeToPro,
  useOpenBillingPortal,
} from "@/hooks/use-subscription-plan-mutations";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BillingSettings() {
  const { data: plan, isLoading } = useSubscriptionPlan();
  const upgrade = useUpgradeToPro();
  const billingPortal = useOpenBillingPortal();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="bg-muted h-6 w-32 rounded" />
        <div className="bg-muted h-4 w-48 rounded" />
        <div className="bg-muted h-9 w-28 rounded" />
      </div>
    );
  }

  const isPro =
    plan?.plan === "pro" &&
    (plan.status === "active" || plan.status === "trialing");

  async function handleUpgrade() {
    try {
      await upgrade.mutateAsync({
        annual: false,
        successUrl: `${window.location.origin}/settings?tab=billing&upgraded=true`,
        cancelUrl: `${window.location.origin}/pricing`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upgrade failed");
    }
  }

  async function handleBillingPortal() {
    try {
      await billingPortal.mutateAsync({
        returnUrl: `${window.location.origin}/settings?tab=billing`,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to open billing portal",
      );
    }
  }

  if (!isPro) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Free plan</span>
          <Badge variant="secondary">Free</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Upgrade to Pro to unlock AI-powered spending insights and push
          notifications.
        </p>
        <Button
          onClick={handleUpgrade}
          disabled={upgrade.isPending}
          className="bg-brand hover:bg-brand/90"
        >
          {upgrade.isPending ? "Redirecting…" : "Upgrade to Pro"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">Pro plan</span>
        {plan.status === "trialing" ? (
          <Badge variant="outline">Trial</Badge>
        ) : (
          <Badge>Active</Badge>
        )}
      </div>

      {plan.isTrialing && plan.trialEnd && (
        <p className="text-muted-foreground text-sm">
          Trial ends on {formatDate(plan.trialEnd)}.
        </p>
      )}

      {plan.cancelAtPeriodEnd && plan.periodEnd && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Subscription cancels on {formatDate(plan.periodEnd)}. You will keep
          access until then.
        </p>
      )}

      {!plan.isTrialing && !plan.cancelAtPeriodEnd && plan.periodEnd && (
        <p className="text-muted-foreground text-sm">
          Next billing date: {formatDate(plan.periodEnd)}.
        </p>
      )}

      <Button
        variant="outline"
        onClick={handleBillingPortal}
        disabled={billingPortal.isPending}
      >
        {billingPortal.isPending ? "Opening…" : "Manage billing"}
      </Button>
    </div>
  );
}
