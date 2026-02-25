import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { NotificationPreferencesValues } from "@repo/shared/validations";
import type { NotificationItem } from "@/lib/types/api";

/** Mark a single notification as read (optimistic: update cache immediately). */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
      return res.json() as Promise<NotificationItem>;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.all });
      // Optimistically update all list queries
      qc.setQueriesData<NotificationItem[]>(
        { queryKey: queryKeys.notifications.all },
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? [],
      );
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/** Mark all notifications as read. */
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/** Save notification preferences. */
export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: NotificationPreferencesValues) => {
      const res = await fetch("/api/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update notification preferences");
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.notificationPreferences.all,
      });
    },
  });
}

/** Subscribe the browser to push notifications. */
export function useSubscribeToPush() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subscription: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    }) => {
      const res = await fetch("/api/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!res.ok) throw new Error("Failed to save push subscription");
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.notificationPreferences.all,
      });
    },
  });
}

/** Unsubscribe the browser from push notifications. */
export function useUnsubscribeFromPush() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (endpoint: string) => {
      const params = new URLSearchParams({ endpoint });
      const res = await fetch(`/api/push-subscriptions?${params.toString()}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove push subscription");
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.notificationPreferences.all,
      });
    },
  });
}
