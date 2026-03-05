import { parseDateString } from "./dates";

export function formatPrice(
  price: string,
  currency: string,
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(parseFloat(price));
}

export interface BillingCycleLabels {
  monthly?: string;
  yearly?: string;
  weekly?: string;
  quarterly?: string;
}

const DEFAULT_BILLING_CYCLE_LABELS: Required<BillingCycleLabels> = {
  monthly: "/mo",
  yearly: "/yr",
  weekly: "/wk",
  quarterly: "/qtr",
};

export function billingCycleLabel(
  cycle: string,
  labels?: BillingCycleLabels,
): string {
  const l = { ...DEFAULT_BILLING_CYCLE_LABELS, ...labels };
  return l[cycle as keyof typeof l] ?? "";
}

export interface RelativeDateLabels {
  overdue?: string;
  today?: string;
  tomorrow?: string;
  /** Template string with `{days}` placeholder, e.g. "in {days} days" */
  inDays?: string;
}

const DEFAULT_RELATIVE_DATE_LABELS: Required<RelativeDateLabels> = {
  overdue: "overdue",
  today: "today",
  tomorrow: "tomorrow",
  inDays: "in {days} days",
};

export function formatRenewalDate(
  dateStr: string,
  locale = "en-US",
  relativeLabels?: RelativeDateLabels,
): string {
  if (!dateStr) return "";
  const date = parseDateString(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.round((date.getTime() - today.getTime()) / msPerDay);

  const formatted = date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const rl = { ...DEFAULT_RELATIVE_DATE_LABELS, ...relativeLabels };

  if (days < 0) return `${formatted} (${rl.overdue})`;
  if (days === 0) return `${formatted} (${rl.today})`;
  if (days === 1) return `${formatted} (${rl.tomorrow})`;
  if (days <= 30)
    return `${formatted} (${rl.inDays.replace("{days}", String(days))})`;
  return formatted;
}

export function formatShortDate(dateStr: string, locale = "en-US"): string {
  if (!dateStr) return "";
  const date = parseDateString(dateStr);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
