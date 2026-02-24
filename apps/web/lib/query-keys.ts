export interface SubscriptionFilters {
  search?: string;
  category?: string;
  sort?: string;
  order?: string;
  active?: boolean;
}

/**
 * Centralized query key factory.
 * Using factory functions enables prefix-based invalidation:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all })
 * invalidates both the list and all detail queries.
 */
export const queryKeys = {
  categories: {
    all: ["categories"] as const,
  },
  subscriptions: {
    all: ["subscriptions"] as const,
    list: (filters: SubscriptionFilters) =>
      ["subscriptions", "list", filters] as const,
    detail: (id: number) => ["subscriptions", "detail", id] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },
  serviceCatalog: {
    search: (q: string) => ["serviceCatalog", "search", q] as const,
  },
} as const;
