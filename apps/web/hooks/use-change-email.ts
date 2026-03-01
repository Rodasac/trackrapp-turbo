import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

interface ChangeEmailParams {
  newEmail: string;
  callbackURL?: string;
}

export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ newEmail, callbackURL }: ChangeEmailParams) => {
      const { data, error } = await authClient.changeEmail({
        newEmail,
        callbackURL: callbackURL ?? "/settings",
      });
      if (error)
        throw new Error(error.message ?? "Failed to send change email request");
      return data;
    },
    onSuccess: () => {
      // Invalidate session so any cached email is refreshed after verification
      void queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}
