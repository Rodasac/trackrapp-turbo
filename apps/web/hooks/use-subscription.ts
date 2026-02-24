import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { SubscriptionDetail } from "@/lib/types/api";

async function fetchSubscription(id: number): Promise<SubscriptionDetail> {
  const res = await fetch(`/api/subscriptions/${id}`);
  if (!res.ok) throw new Error("Subscription not found");
  return res.json();
}

export function useSubscription(id: number) {
  return useQuery({
    queryKey: queryKeys.subscriptions.detail(id),
    queryFn: () => fetchSubscription(id),
  });
}
