import type {
  CategoryItem,
  SubscriptionListItem,
  SubscriptionDetail,
  DashboardStats,
  DashboardCharts,
  RenewalItem,
  StaticTip,
  PriceHistoryItem,
  NotificationItem,
  NotificationPreferencesResponse,
  SubscriptionPlanResponse,
} from "@/lib/types/api";

export function mockCategory(overrides?: Partial<CategoryItem>): CategoryItem {
  return {
    id: 1,
    name: "Entertainment",
    color: "#6366f1",
    icon: "tv",
    userId: "user-1",
    ...overrides,
  };
}

export function mockSubscriptionListItem(
  overrides?: Partial<SubscriptionListItem>,
): SubscriptionListItem {
  return {
    id: 1,
    name: "Netflix",
    price: "15.99",
    currency: "USD",
    billingCycle: "monthly",
    nextRenewalDate: "2026-03-15",
    isActive: true,
    logoUrl: null,
    websiteUrl: "https://netflix.com",
    category: mockCategory(),
    ...overrides,
  };
}

export function mockPriceHistory(
  overrides?: Partial<PriceHistoryItem>,
): PriceHistoryItem {
  return {
    id: 1,
    price: "15.99",
    recordedAt: "2026-01-01",
    ...overrides,
  };
}

export function mockSubscriptionDetail(
  overrides?: Partial<SubscriptionDetail>,
): SubscriptionDetail {
  return {
    ...mockSubscriptionListItem(),
    description: "Streaming service",
    startDate: "2025-01-01",
    notes: "Family plan",
    categoryId: 1,
    serviceCatalogId: null,
    priceHistory: [mockPriceHistory()],
    ...overrides,
  };
}

export function mockDashboardStats(
  overrides?: Partial<DashboardStats>,
): DashboardStats {
  return {
    monthlySpend: "45.97",
    yearlySpend: "551.64",
    activeCount: 3,
    upcomingRenewals: 1,
    costPerDay: "1.53",
    remainingThisMonth: "15.99",
    ...overrides,
  };
}

export function mockDashboardCharts(
  overrides?: Partial<DashboardCharts>,
): DashboardCharts {
  return {
    spendingTrend: [
      { month: "Jan '25", total: 45.97 },
      { month: "Feb '25", total: 50.0 },
    ],
    categoryBreakdown: [
      { name: "Entertainment", total: 30.0, color: "#6366f1" },
      { name: "Productivity", total: 15.97, color: "#22c55e" },
    ],
    topSubscriptions: [
      { name: "Netflix", monthlyRate: 15.99, billingCycle: "monthly" },
      { name: "Spotify", monthlyRate: 9.99, billingCycle: "monthly" },
    ],
    ...overrides,
  };
}

export function mockSession() {
  return {
    session: {
      id: "session-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
    user: {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
    },
  };
}

export function mockNotification(
  overrides?: Partial<NotificationItem>,
): NotificationItem {
  return {
    id: 1,
    userId: "user-1",
    type: "renewal_reminder",
    title: "Netflix renews tomorrow",
    message: "Your Netflix subscription (USD 15.99) renews tomorrow.",
    relatedSubscriptionId: 1,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function mockNotificationPreferences(
  overrides?: Partial<NotificationPreferencesResponse>,
): NotificationPreferencesResponse {
  return {
    id: 1,
    userId: "user-1",
    emailEnabled: true,
    pushEnabled: false,
    reminderDaysBefore: [7, 3, 1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function mockSubscriptionPlan(
  overrides?: Partial<SubscriptionPlanResponse>,
): SubscriptionPlanResponse {
  return {
    plan: "free",
    status: null,
    isTrialing: false,
    trialEnd: null,
    cancelAtPeriodEnd: false,
    periodEnd: null,
    stripeSubscriptionId: null,
    ...overrides,
  };
}

export function mockProPlan(
  overrides?: Partial<SubscriptionPlanResponse>,
): SubscriptionPlanResponse {
  return {
    plan: "pro",
    status: "active",
    isTrialing: false,
    trialEnd: null,
    cancelAtPeriodEnd: false,
    periodEnd: "2026-03-25T00:00:00.000Z",
    stripeSubscriptionId: "sub_pro123",
    ...overrides,
  };
}

export function mockTrialingPlan(
  overrides?: Partial<SubscriptionPlanResponse>,
): SubscriptionPlanResponse {
  return {
    plan: "pro",
    status: "trialing",
    isTrialing: true,
    trialEnd: "2026-03-10T00:00:00.000Z",
    cancelAtPeriodEnd: false,
    periodEnd: "2026-03-10T00:00:00.000Z",
    stripeSubscriptionId: "sub_trial123",
    ...overrides,
  };
}

export function mockRenewalItem(overrides?: Partial<RenewalItem>): RenewalItem {
  return {
    id: 1,
    name: "Netflix",
    price: "15.99",
    currency: "USD",
    billingCycle: "monthly",
    nextRenewalDate: "2026-03-05",
    logoUrl: null,
    ...overrides,
  };
}

export function mockStaticTip(overrides?: Partial<StaticTip>): StaticTip {
  return {
    id: "daily-cost",
    title: "Your subscription cost per day",
    message: "You spend $1.50/day across all subscriptions.",
    type: "info",
    ...overrides,
  };
}

export function mockServiceCatalogEntry(overrides?: {
  id?: number;
  name?: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}) {
  return {
    id: 1,
    name: "Netflix",
    websiteUrl: "https://netflix.com",
    logoUrl: "https://netflix.com/logo.png",
    ...overrides,
  };
}
