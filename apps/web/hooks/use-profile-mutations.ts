import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

interface UpdateProfileParams {
  name: string;
  image?: string;
}

interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async ({ name, image }: UpdateProfileParams) => {
      const { data, error } = await authClient.updateUser({ name, image });
      if (error) throw new Error(error.message ?? "Failed to update profile");
      return data;
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
      revokeOtherSessions,
    }: ChangePasswordParams) => {
      const { data, error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      });
      if (error) throw new Error(error.message ?? "Failed to change password");
      return data;
    },
  });
}
