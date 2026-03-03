import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

const ADMIN_USERS_KEY = ["admin", "users"] as const;

interface BanUserParams {
  userId: string;
  banReason?: string;
}

interface UnbanUserParams {
  userId: string;
}

interface SetRoleParams {
  userId: string;
  role: string;
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, banReason }: BanUserParams) => {
      const { data, error } = await authClient.admin.banUser({ userId, banReason });
      if (error) throw new Error(error.message ?? "Failed to ban user");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId }: UnbanUserParams) => {
      const { data, error } = await authClient.admin.unbanUser({ userId });
      if (error) throw new Error(error.message ?? "Failed to unban user");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: SetRoleParams) => {
      const { data, error } = await authClient.admin.setRole({ userId, role });
      if (error) throw new Error(error.message ?? "Failed to set user role");
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}
