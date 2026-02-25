import { useQuery } from "@tanstack/react-query";
import { queryKeys, type NotificationFilters } from "@/lib/query-keys";
import type { NotificationItem } from "@/lib/types/api";

async function fetchNotifications(
  filters: NotificationFilters,
): Promise<NotificationItem[]> {
  const params = new URLSearchParams();
  if (filters.read !== undefined) params.set("read", String(filters.read));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));

  const res = await fetch(`/api/notifications?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => fetchNotifications(filters),
  });
}
