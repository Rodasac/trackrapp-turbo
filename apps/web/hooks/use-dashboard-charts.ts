import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { DashboardCharts } from "@/lib/types/api";

async function fetchDashboardCharts(): Promise<DashboardCharts> {
  const res = await fetch("/api/dashboard/charts");
  if (!res.ok) throw new Error("Failed to fetch dashboard charts");
  return res.json();
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: queryKeys.dashboard.charts,
    queryFn: fetchDashboardCharts,
  });
}
