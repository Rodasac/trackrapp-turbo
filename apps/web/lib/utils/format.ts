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
  // Parse as local date to avoid UTC offset shifts
  const parts = dateStr.split("-").map(Number);
  const date = new Date(parts[0]!, parts[1]! - 1, parts[2]!);
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
  const parts2 = dateStr.split("-").map(Number);
  const date = new Date(parts2[0]!, parts2[1]! - 1, parts2[2]!);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
