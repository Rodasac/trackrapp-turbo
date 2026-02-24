import { DashboardKpis } from "@/components/dashboard-kpis";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Your subscription overview
        </p>
      </div>

      {/* Live KPI cards */}
      <DashboardKpis />

      {/* Placeholder for charts — added in a future step */}
      <div className="text-muted-foreground rounded-lg border border-dashed py-16 text-center text-sm">
        Charts and insights will appear here once you add subscriptions.
      </div>
    </div>
  );
}
