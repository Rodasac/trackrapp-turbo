"use client";

import { DollarSign, TrendingUp, Calendar, Activity } from "lucide-react";
import { KpiCard } from "@repo/ui/kpi-card";
import { formatPrice } from "@repo/shared/format";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

export function DashboardKpis() {
  const { data: stats } = useDashboardStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Monthly spend"
        value={stats ? formatPrice(stats.monthlySpend, "USD") : "—"}
        icon={DollarSign}
        description="Across all active subscriptions"
      />
      <KpiCard
        title="Yearly spend"
        value={stats ? formatPrice(stats.yearlySpend, "USD") : "—"}
        icon={TrendingUp}
        description="Projected annual total"
      />
      <KpiCard
        title="Active subscriptions"
        value={stats ? String(stats.activeCount) : "—"}
        icon={Activity}
        description="Currently tracked"
      />
      <KpiCard
        title="Upcoming renewals"
        value={stats ? String(stats.upcomingRenewals) : "—"}
        icon={Calendar}
        description="Due in the next 7 days"
      />
    </div>
  );
}
