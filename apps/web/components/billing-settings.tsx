"use client";

import { toast } from "sonner";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("billing");
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
        cancelUrl: `${window.location.origin}/settings?tab=billing&upgraded=false`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("upgradeFailed"));
    }
  }

  async function handleBillingPortal() {
    try {
      await billingPortal.mutateAsync({
        returnUrl: `${window.location.origin}/settings?tab=billing`,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("billingPortalFailed"),
      );
    }
  }

  if (!isPro) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">{t("freePlanLabel")}</span>
          <Badge variant="secondary">{t("freeBadge")}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {t("upgradeDescription")}
        </p>
        <Button
          onClick={handleUpgrade}
          disabled={upgrade.isPending}
          className="bg-brand hover:bg-brand/90"
        >
          {upgrade.isPending ? t("upgradeButtonLoading") : t("upgradeButton")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">{t("proPlanLabel")}</span>
        {plan.status === "trialing" ? (
          <Badge variant="outline">{t("trialBadge")}</Badge>
        ) : (
          <Badge>{t("activeBadge")}</Badge>
        )}
      </div>

      {plan.isTrialing && plan.trialEnd && (
        <p className="text-muted-foreground text-sm">
          {t("trialEndsMessage", { date: formatDate(plan.trialEnd) })}
        </p>
      )}

      {plan.cancelAtPeriodEnd && plan.periodEnd && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {t("subscriptionCancelsMessage", { date: formatDate(plan.periodEnd) })}
        </p>
      )}

      {!plan.isTrialing && !plan.cancelAtPeriodEnd && plan.periodEnd && (
        <p className="text-muted-foreground text-sm">
          {t("nextBillingDateMessage", { date: formatDate(plan.periodEnd) })}
        </p>
      )}

      <Button
        variant="outline"
        onClick={handleBillingPortal}
        disabled={billingPortal.isPending}
      >
        {billingPortal.isPending ? t("manageBillingButtonLoading") : t("manageBillingButton")}
      </Button>
    </div>
  );
}
