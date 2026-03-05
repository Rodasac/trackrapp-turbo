import { getTranslations } from "next-intl/server";
import { DashboardKpis } from "@/components/dashboard-kpis";
import { DashboardCharts } from "@/components/dashboard-charts";
import { RenewalCalendar } from "@/components/renewal-calendar";
import { StaticTipsList } from "@/components/static-tips-list";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      {/* Live KPI cards — 6 cards in a 3-col responsive grid */}
      <DashboardKpis />

      {/* Charts + right column: Calendar, Tips */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: charts take 2/3 width */}
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>

        {/* Right: renewal calendar + spending insights */}
        <div className="space-y-4">
          <RenewalCalendar />
          <StaticTipsList />
        </div>
      </div>
    </div>
  );
}
