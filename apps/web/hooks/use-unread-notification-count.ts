import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { UnreadCountResponse } from "@/lib/types/api";

async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const res = await fetch("/api/notifications/unread-count");
  if (!res.ok) throw new Error("Failed to fetch unread count");
  return res.json();
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000, // poll every 60s
  });
}
