import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { SubscriptionPlanResponse } from "@/lib/types/api";

interface UseSubscriptionPlanOptions {
  enabled?: boolean;
}

export function useSubscriptionPlan(opts?: UseSubscriptionPlanOptions) {
  return useQuery<SubscriptionPlanResponse>({
    queryKey: queryKeys.subscriptionPlan.all,
    queryFn: async () => {
      const res = await fetch("/api/subscription-plan");
      if (!res.ok) throw new Error("Failed to fetch subscription plan");
      return res.json() as Promise<SubscriptionPlanResponse>;
    },
    enabled: opts?.enabled ?? true,
  });
}

/** Convenience hook — returns true when the user has an active or trialing Pro plan. */
export function useIsPro() {
  const { data } = useSubscriptionPlan();
  return (
    data?.plan === "pro" &&
    (data.status === "active" || data.status === "trialing")
  );
}
