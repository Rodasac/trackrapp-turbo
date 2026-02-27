"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { useDashboardCharts } from "@/hooks/use-dashboard-charts";
import { SpendingTrendChart } from "./charts/spending-trend-chart";
import { CategoryBreakdownChart } from "./charts/category-breakdown-chart";
import { TopSubscriptionsChart } from "./charts/top-subscriptions-chart";

export function DashboardCharts() {
  const { data, isLoading } = useDashboardCharts();

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
          <CardTitle className="text-base">Spending trend</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingTrendChart data={data?.spendingTrend ?? []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart data={data?.categoryBreakdown ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <TopSubscriptionsChart data={data?.topSubscriptions ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
