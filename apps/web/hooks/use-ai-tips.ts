import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { AiTipItem } from "@/lib/types/api";

export function useAiTips(opts?: { enabled?: boolean }) {
  return useQuery<AiTipItem[]>({
    queryKey: queryKeys.aiTips.all,
    queryFn: async () => {
      const res = await fetch("/api/tips");
      if (res.status === 403) return [];
      if (!res.ok) throw new Error("Failed to fetch AI tips");
      return res.json();
    },
    enabled: opts?.enabled ?? true,
  });
}
