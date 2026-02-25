import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { NotificationPreferencesResponse } from "@/lib/types/api";

async function fetchNotificationPreferences(): Promise<NotificationPreferencesResponse> {
  const res = await fetch("/api/notification-preferences");
  if (!res.ok) throw new Error("Failed to fetch notification preferences");
  return res.json();
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notificationPreferences.all,
    queryFn: fetchNotificationPreferences,
  });
}
