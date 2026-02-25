/** Wire types matching the JSON shape returned by API routes (string dates from serialization). */

export interface CategoryItem {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
  userId: string | null;
}

export interface PriceHistoryItem {
  id: number;
  price: string;
  recordedAt: string;
}

export interface SubscriptionListItem {
  id: number;
  name: string;
  price: string;
  currency: string;
  billingCycle: string;
  nextRenewalDate: string;
  isActive: boolean;
  logoUrl: string | null;
  websiteUrl: string | null;
  category: CategoryItem | null;
}

export interface SubscriptionDetail extends SubscriptionListItem {
  description: string | null;
  startDate: string | null;
  notes: string | null;
  categoryId: number | null;
  serviceCatalogId: number | null;
  priceHistory: PriceHistoryItem[];
}

export interface DashboardStats {
  monthlySpend: string;
  yearlySpend: string;
  activeCount: number;
  upcomingRenewals: number;
}

export interface NotificationItem {
  id: number;
  userId: string;
  type: "renewal_reminder" | "price_change" | "tip" | "system";
  title: string;
  message: string;
  relatedSubscriptionId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferencesResponse {
  id: number;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  reminderDaysBefore: number[];
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface SubscriptionPlanResponse {
  plan: "free" | "pro";
  status: "active" | "trialing" | "canceled" | "past_due" | "incomplete" | null;
  isTrialing: boolean;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
  stripeSubscriptionId: string | null;
}
