import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { ServiceCatalogEntry } from "@repo/database";

async function searchServiceCatalog(q: string): Promise<ServiceCatalogEntry[]> {
  const res = await fetch(
    `/api/service-catalog?q=${encodeURIComponent(q)}&limit=10`,
  );
  if (!res.ok) throw new Error("Failed to search service catalog");
  return res.json();
}

export function useServiceCatalogSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.serviceCatalog.search(query),
    queryFn: () => searchServiceCatalog(query),
    enabled: query.length > 0,
  });
}
