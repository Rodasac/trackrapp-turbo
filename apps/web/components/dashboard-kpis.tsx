"use client";

import {
  DollarSign,
  TrendingUp,
  Calendar,
  Activity,
  Clock,
  CalendarDays,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { KpiCard } from "@repo/ui/kpi-card";
import { formatPrice } from "@repo/shared/format";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

export function DashboardKpis() {
  const t = useTranslations("dashboard.kpis");
  const { data: stats } = useDashboardStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        title={t("monthlySpend")}
        value={stats ? formatPrice(stats.monthlySpend, "USD") : "—"}
        icon={DollarSign}
        description={t("monthlySpendDesc")}
      />
      <KpiCard
        title={t("yearlySpend")}
        value={stats ? formatPrice(stats.yearlySpend, "USD") : "—"}
        icon={TrendingUp}
        description={t("yearlySpendDesc")}
      />
      <KpiCard
        title={t("costPerDay")}
        value={stats ? formatPrice(stats.costPerDay, "USD") : "—"}
        icon={Clock}
        description={t("costPerDayDesc")}
      />
      <KpiCard
        title={t("activeSubscriptions")}
        value={stats ? String(stats.activeCount) : "—"}
        icon={Activity}
        description={t("activeSubscriptionsDesc")}
      />
      <KpiCard
        title={t("upcomingRenewals")}
        value={stats ? String(stats.upcomingRenewals) : "—"}
        icon={Calendar}
        description={t("upcomingRenewalsDesc")}
      />
      <KpiCard
        title={t("remainingThisMonth")}
        value={stats ? formatPrice(stats.remainingThisMonth, "USD") : "—"}
        icon={CalendarDays}
        description={t("remainingThisMonthDesc")}
      />
    </div>
  );
}
