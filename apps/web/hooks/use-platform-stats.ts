import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { PlatformStatsResponse } from "@/lib/types/api";

async function fetchPlatformStats(): Promise<PlatformStatsResponse> {
  const res = await fetch("/api/platform-stats");
  if (!res.ok) throw new Error("Failed to fetch platform stats");
  return res.json() as Promise<PlatformStatsResponse>;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: queryKeys.platformStats.all,
    queryFn: fetchPlatformStats,
    staleTime: 60 * 60 * 1000, // 1 hour — data only changes twice daily
  });
}
