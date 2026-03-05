"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { useDashboardCharts } from "@/hooks/use-dashboard-charts";
import { useIsPro } from "@/hooks/use-subscription-plan";
import { SpendingTrendChart } from "./charts/spending-trend-chart";
import { CategoryBreakdownChart } from "./charts/category-breakdown-chart";
import { TopSubscriptionsChart } from "./charts/top-subscriptions-chart";

export function DashboardCharts() {
  const t = useTranslations("dashboard.charts");
  const isPro = useIsPro();
  const { data, isLoading } = useDashboardCharts();

  if (!isPro) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <BarChart3 className="size-6 text-muted-foreground" />
          </div>
          <Badge className="mb-3">Pro</Badge>
          <h3 className="mb-2 text-lg font-semibold">{t("title")}</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            {t("upgradeDescription")}
          </p>
          <Button asChild>
            <Link href="/pricing">{t("viewPlans")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div data-testid="dashboard-charts-loading" className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div data-testid="dashboard-charts" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("spendingTrend")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingTrendChart data={data?.spendingTrend ?? []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("categoryBreakdown")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart data={data?.categoryBreakdown ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("topSubscriptions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TopSubscriptionsChart data={data?.topSubscriptions ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
