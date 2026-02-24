import { DollarSign, TrendingUp, Calendar, Activity } from "lucide-react";
import { KpiCard } from "@repo/ui/kpi-card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Your subscription overview
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Monthly spend"
          value="$0.00"
          icon={DollarSign}
          description="Across all active subscriptions"
        />
        <KpiCard
          title="Yearly spend"
          value="$0.00"
          icon={TrendingUp}
          description="Projected annual total"
        />
        <KpiCard
          title="Active subscriptions"
          value="0"
          icon={Activity}
          description="Currently tracked"
        />
        <KpiCard
          title="Upcoming renewals"
          value="0"
          icon={Calendar}
          description="Due in the next 7 days"
        />
      </div>

      {/* Placeholder for charts — added in Phase 3 */}
      <div className="text-muted-foreground rounded-lg border border-dashed py-16 text-center text-sm">
        Charts and insights will appear here once you add subscriptions.
      </div>
    </div>
  );
}
