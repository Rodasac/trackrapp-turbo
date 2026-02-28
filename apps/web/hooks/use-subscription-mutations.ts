import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type {
  SubscriptionFormValues,
  CategoryFormValues,
} from "@repo/shared/validations";
import { dynamicIconImports } from "lucide-react/dynamic";

function invalidateSubscriptionsAndStats(
  qc: ReturnType<typeof useQueryClient>,
  id?: number,
) {
  void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
  void qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
  if (id !== undefined) {
    void qc.invalidateQueries({ queryKey: queryKeys.subscriptions.detail(id) });
  }
}

/** Create (POST) or update (PUT) a subscription. */
export function useSaveSubscription(
  mode: "create" | "edit",
  subscriptionId?: number,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: SubscriptionFormValues) => {
      const url =
        mode === "create"
          ? "/api/subscriptions"
          : `/api/subscriptions/${subscriptionId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Something went wrong",
        );
      }
      return res.json();
    },
    onSuccess: () => {
      invalidateSubscriptionsAndStats(qc, subscriptionId);
    },
  });
}

/** Create a new category. */
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          color: values.color,
          icon:
            values.icon === "none"
              ? null
              : (values.icon as keyof typeof dynamicIconImports),
        }),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/** Deactivate (soft-delete) a subscription. */
export function useDeactivateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to deactivate");
      return res.json();
    },
    onSuccess: (_data, id) => {
      invalidateSubscriptionsAndStats(qc, id);
    },
  });
}

/** Permanently delete a subscription. */
export function useDeleteSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/subscriptions/${id}?hard=true`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: (_data, id) => {
      invalidateSubscriptionsAndStats(qc, id);
    },
  });
}
