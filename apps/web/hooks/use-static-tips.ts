import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { StaticTip } from "@/lib/types/api";

async function fetchStaticTips(): Promise<StaticTip[]> {
  const res = await fetch("/api/dashboard/tips");
  if (!res.ok) throw new Error("Failed to fetch tips");
  return res.json();
}

export function useStaticTips() {
  return useQuery({
    queryKey: queryKeys.dashboard.tips,
    queryFn: fetchStaticTips,
  });
}
