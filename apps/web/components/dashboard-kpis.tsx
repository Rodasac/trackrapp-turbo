"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Calendar, Activity } from "lucide-react";
import { KpiCard } from "@repo/ui/kpi-card";

interface DashboardStats {
  monthlySpend: string;
  yearlySpend: string;
  activeCount: number;
  upcomingRenewals: number;
}

function formatUSD(value: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(parseFloat(value));
}

export function DashboardKpis() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data: DashboardStats) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Monthly spend"
        value={stats ? formatUSD(stats.monthlySpend) : "—"}
        icon={DollarSign}
        description="Across all active subscriptions"
      />
      <KpiCard
        title="Yearly spend"
        value={stats ? formatUSD(stats.yearlySpend) : "—"}
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
