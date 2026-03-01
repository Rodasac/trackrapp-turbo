import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { UserPreferencesResponse } from "@/lib/types/api";

export function useUserPreferences() {
  return useQuery<UserPreferencesResponse>({
    queryKey: queryKeys.userPreferences.all,
    queryFn: async () => {
      const res = await fetch("/api/user-preferences");
      if (!res.ok) throw new Error("Failed to load preferences");
      return res.json() as Promise<UserPreferencesResponse>;
    },
  });
}

export function useUpdateUserPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: { autoRenewDefault: boolean }) => {
      const res = await fetch("/api/user-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error("Failed to update preferences");
      return res.json() as Promise<UserPreferencesResponse>;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.userPreferences.all });
    },
  });
}
