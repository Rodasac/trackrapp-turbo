/** Wire types matching the JSON shape returned by API routes (string dates from serialization). */
import { IconName } from "lucide-react/dynamic";

export interface CategoryItem {
  id: number;
  name: string;
  color: string | null;
  icon: IconName | null;
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
  autoRenew: boolean | null;
  previousRenewalDate: string | null;
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
  costPerDay: string;
  remainingThisMonth: string;
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

export interface RenewalItem {
  id: number;
  name: string;
  price: string;
  currency: string;
  billingCycle: string;
  nextRenewalDate: string;
  logoUrl: string | null;
}

export interface StaticTip {
  id: string;
  title: string;
  message: string;
  type: "savings" | "warning" | "info";
}

export interface SpendingTrendPoint {
  month: string;
  total: number;
}

export interface CategoryBreakdownItem {
  name: string;
  total: number;
  color: string;
}

export interface TopSubscriptionItem {
  name: string;
  monthlyRate: number;
  billingCycle: string;
}

export interface DashboardCharts {
  spendingTrend: SpendingTrendPoint[];
  categoryBreakdown: CategoryBreakdownItem[];
  topSubscriptions: TopSubscriptionItem[];
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

export interface CsvImportPreviewRow {
  rowIndex: number;
  name: string;
  price: string;
  currency: string;
  billingCycle: string;
  nextRenewalDate: string;
  startDate: string | null;
  categoryName: string | null;
  matchedService: {
    id: number;
    name: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    defaultCategory: string | null;
  } | null;
  matchConfidence: "exact" | "fuzzy" | "none";
  resolvedCategoryId: number | null;
  isValid: boolean;
  errors: { field: string; message: string }[];
}

export interface CsvImportPreviewResponse {
  rows: CsvImportPreviewRow[];
}

export interface CsvImportResult {
  imported: number;
  failed: number;
  errors: { rowIndex: number; message: string }[];
}

export interface AccountProviderResponse {
  provider: "credential" | "google";
}

export interface AiTipItem {
  id: number;
  title: string;
  message: string;
  category: "savings" | "warning" | "info" | "comparison";
  generatedAt: string;
  expiresAt: string;
}

export interface UserPreferencesResponse {
  autoRenewDefault: boolean;
}

export interface PlatformStatsResponse {
  totalSubscriptions: number;
  totalUsers: number;
  totalReminders: number;
  totalSaved: string;
  computedAt: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: "user" | "admin" | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
}

export interface AdminStatsResponse {
  totalUsers: number;
  activeUsers30d: number;
  proUsers: number;
  freeUsers: number;
  totalSubscriptions: number;
  signups7d: number;
  signups30d: number;
  bannedUsers: number;
}
