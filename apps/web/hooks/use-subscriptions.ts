import { useQuery } from "@tanstack/react-query";
import { queryKeys, type SubscriptionFilters } from "@/lib/query-keys";
import type { SubscriptionListItem } from "@/lib/types/api";

async function fetchSubscriptions(
  filters: SubscriptionFilters,
): Promise<SubscriptionListItem[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  if (filters.active !== undefined)
    params.set("active", String(filters.active));

  const res = await fetch(`/api/subscriptions?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch subscriptions");
  return res.json();
}

export function useSubscriptions(filters: SubscriptionFilters = {}) {
  return useQuery({
    queryKey: queryKeys.subscriptions.list(filters),
    queryFn: () => fetchSubscriptions(filters),
  });
}
