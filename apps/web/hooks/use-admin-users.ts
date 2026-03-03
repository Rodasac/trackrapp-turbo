import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";
import type { AdminUserListResponse } from "@/lib/types/api";

export interface AdminUsersParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export function useAdminUsers(params: AdminUsersParams = {}) {
  return useQuery<AdminUserListResponse>({
    queryKey: queryKeys.admin.users(params as Record<string, unknown>),
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          searchValue: params.search,
          searchField: "email",
          limit: params.limit ?? 20,
          offset: params.offset ?? 0,
        },
      });
      if (error) throw new Error(error.message ?? "Failed to list users");
      return {
        users: (data?.users ?? []) as unknown as AdminUserListResponse["users"],
        total: data?.total ?? 0,
      };
    },
  });
}
