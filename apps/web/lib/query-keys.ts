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
export interface NotificationFilters {
  read?: boolean;
  limit?: number;
  offset?: number;
}

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
    charts: ["dashboard", "charts"] as const,
    renewals: ["dashboard", "renewals"] as const,
    tips: ["dashboard", "tips"] as const,
  },
  serviceCatalog: {
    search: (q: string) => ["serviceCatalog", "search", q] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (filters: NotificationFilters) =>
      ["notifications", "list", filters] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
  notificationPreferences: {
    all: ["notification-preferences"] as const,
  },
  subscriptionPlan: {
    all: ["subscription-plan"] as const,
  },
  aiTips: {
    all: ["ai-tips"] as const,
  },
  accountProvider: {
    all: ["account-provider"] as const,
  },
} as const;
