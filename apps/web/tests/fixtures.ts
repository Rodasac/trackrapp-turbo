import type {
  CategoryItem,
  SubscriptionListItem,
  SubscriptionDetail,
  DashboardStats,
  PriceHistoryItem,
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
