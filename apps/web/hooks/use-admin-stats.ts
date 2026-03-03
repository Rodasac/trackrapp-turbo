import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { AdminStatsResponse } from "@/lib/types/api";

export function useAdminStats() {
  return useQuery<AdminStatsResponse>({
    queryKey: queryKeys.admin.stats,
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json() as Promise<AdminStatsResponse>;
    },
  });
}
