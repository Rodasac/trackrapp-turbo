import { parseDateString } from "./dates.js";

export function formatPrice(price: string, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(parseFloat(price));
}

export function billingCycleLabel(cycle: string): string {
  switch (cycle) {
    case "monthly":
      return "/mo";
    case "yearly":
      return "/yr";
    case "weekly":
      return "/wk";
    case "quarterly":
      return "/qtr";
    default:
      return "";
  }
}

export function formatRenewalDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = parseDateString(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.round((date.getTime() - today.getTime()) / msPerDay);

  const formatted = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (days < 0) return `${formatted} (overdue)`;
  if (days === 0) return `${formatted} (today)`;
  if (days === 1) return `${formatted} (tomorrow)`;
  if (days <= 30) return `${formatted} (in ${days} days)`;
  return formatted;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = parseDateString(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
