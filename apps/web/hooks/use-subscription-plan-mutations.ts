import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";

interface UpgradeParams {
  annual: boolean;
  successUrl: string;
  cancelUrl: string;
}

interface BillingPortalParams {
  returnUrl: string;
}

export function useUpgradeToPro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ annual, successUrl, cancelUrl }: UpgradeParams) => {
      const { data, error } = await authClient.subscription.upgrade({
        plan: "pro",
        annual,
        successUrl,
        cancelUrl,
      });
      if (error) throw new Error(error.message ?? "Upgrade failed");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptionPlan.all });
    },
  });
}

export function useOpenBillingPortal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ returnUrl }: BillingPortalParams) => {
      const { data, error } = await authClient.subscription.billingPortal({ returnUrl });
      if (error) throw new Error(error.message ?? "Failed to open billing portal");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.subscriptionPlan.all });
    },
  });
}
