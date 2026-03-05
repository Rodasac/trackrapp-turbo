"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";
import { cn } from "@repo/ui/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { useUpgradeToPro } from "@/hooks/use-subscription-plan-mutations";
import { FREE_FEATURES, PRO_FEATURES } from "@/lib/pricing-data";
import {
  PRICING,
  PRO_EFFECTIVE_MONTHLY,
  PRO_ANNUAL_DISCOUNT_PCT,
} from "@/lib/pricing-config";
import { useTranslations } from "next-intl";

/**
 * Shared pricing card grid + toggle — consumed by both PricingSection and PricingPage.
 * Keeps both views in sync without duplication.
 */
export function PricingCards() {
  const [annual, setAnnual] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const { data: plan } = useSubscriptionPlan({ enabled: isLoggedIn });
  const upgrade = useUpgradeToPro();

  const t = useTranslations("pricing");
  const tBilling = useTranslations("billing");

  const isPro =
    plan?.plan === "pro" &&
    (plan.status === "active" || plan.status === "trialing");

  async function handleUpgrade() {
    try {
      await upgrade.mutateAsync({
        annual,
        successUrl: `${window.location.origin}/settings?tab=billing&upgraded=true`,
        cancelUrl: `${window.location.origin}/pricing`,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : tBilling("upgradeFailed"),
      );
    }
  }

  return (
    <>
      {/* Monthly / Annual toggle */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <Button
          variant={annual ? "ghost" : "secondary"}
          size="sm"
          onClick={() => setAnnual(false)}
        >
          {t("monthly")}
        </Button>
        <Button
          variant={annual ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setAnnual(true)}
        >
          {t("annual")}
        </Button>
        {annual && (
          <Badge variant="outline" className="text-brand border-brand ml-1">
            {t("savePercentage", { percentage: PRO_ANNUAL_DISCOUNT_PCT })}
          </Badge>
        )}
      </div>

      {/* Card grid */}
      <div className="mt-8 grid w-full max-w-3xl gap-6 sm:grid-cols-2 mx-auto">
        {/* Free */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>{t("free.name")}</CardTitle>
            <CardDescription>{t("free.description")}</CardDescription>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">
                ${PRICING.free.monthly}
              </span>
              <span className="text-muted-foreground text-sm">
                {t("free.perMonth")}
              </span>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="mt-4">
            <ul className="flex flex-col gap-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="text-brand size-4 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/signup">{t("free.getStarted")}</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pro */}
        <Card className={cn("border-brand relative glow")}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-brand text-brand-foreground">
              {t("pro.mostPopular")}
            </Badge>
          </div>
          <CardHeader>
            <CardTitle>{t("pro.name")}</CardTitle>
            <CardDescription>{t("pro.description")}</CardDescription>
            <div className="mt-2 flex items-baseline gap-1">
              {annual ? (
                <>
                  <span className="text-3xl font-bold">
                    ${PRICING.pro.annual}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {t("pro.perYear")}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold">
                    ${PRICING.pro.monthly}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {t("pro.perMonth")}
                  </span>
                </>
              )}
            </div>
            {annual && (
              <p className="text-muted-foreground text-xs">
                ${PRO_EFFECTIVE_MONTHLY}
                {t("pro.effectiveMonthly")}{" "}
                {t("pro.savings", { percentage: PRO_ANNUAL_DISCOUNT_PCT })}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              {t("pro.trialDays", { days: PRICING.pro.trialDays })}
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="mt-4">
            <ul className="flex flex-col gap-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="text-brand size-4 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {isPro ? (
              <Button className="w-full" disabled>
                {t("pro.currentPlan")}
              </Button>
            ) : isLoggedIn ? (
              <Button
                className="bg-brand hover:bg-brand/90 w-full"
                onClick={handleUpgrade}
                disabled={upgrade.isPending}
              >
                {upgrade.isPending
                  ? tBilling("upgradeButtonLoading")
                  : t("pro.startTrial")}
              </Button>
            ) : (
              <Button className="bg-brand hover:bg-brand/90 w-full" asChild>
                <Link href="/signup?plan=pro">{t("pro.startTrial")}</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
