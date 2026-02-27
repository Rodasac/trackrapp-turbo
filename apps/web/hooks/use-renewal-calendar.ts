import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { RenewalItem } from "@/lib/types/api";

async function fetchRenewals(): Promise<RenewalItem[]> {
  const res = await fetch("/api/dashboard/renewals");
  if (!res.ok) throw new Error("Failed to fetch renewals");
  return res.json();
}

export function useRenewalCalendar() {
  return useQuery({
    queryKey: queryKeys.dashboard.renewals,
    queryFn: fetchRenewals,
  });
}
