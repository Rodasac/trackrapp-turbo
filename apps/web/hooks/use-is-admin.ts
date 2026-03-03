import { useSession } from "@/lib/auth-client";

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  return (session?.user as { role?: string } | undefined)?.role === "admin";
}
