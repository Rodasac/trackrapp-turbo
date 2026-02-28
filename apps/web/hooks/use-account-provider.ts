import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { AccountProviderResponse } from "@/lib/types/api";

export function useAccountProvider() {
  return useQuery<AccountProviderResponse>({
    queryKey: queryKeys.accountProvider.all,
    queryFn: async () => {
      const res = await fetch("/api/account-provider");
      if (!res.ok) throw new Error("Failed to fetch account provider");
      return res.json() as Promise<AccountProviderResponse>;
    },
  });
}
