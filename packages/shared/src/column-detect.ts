export type TrackrField =
  | "name"
  | "price"
  | "currency"
  | "billingCycle"
  | "nextRenewalDate"
  | "categoryName"
  | "startDate"
  | "status";

// The exact headers produced by TrackrApp's CSV export
export const TRACKR_EXPORT_HEADERS = [
  "Name",
  "Price",
  "Currency",
  "Billing Cycle",
  "Next Renewal",
  "Category",
  "Start Date",
  "Status",
] as const;

const ALIAS_MAP: Record<string, TrackrField> = {
  // Name
  name: "name",
  service: "name",
  subscription: "name",
  provider: "name",
  vendor: "name",
  app: "name",
  // Price
  price: "price",
  amount: "price",
  cost: "price",
  fee: "price",
  charge: "price",
  rate: "price",
  // Currency
  currency: "currency",
  curr: "currency",
  // Billing Cycle
  "billing cycle": "billingCycle",
  billing_cycle: "billingCycle",
  frequency: "billingCycle",
  period: "billingCycle",
  interval: "billingCycle",
  cycle: "billingCycle",
  // Next Renewal
  "next renewal": "nextRenewalDate",
  "renewal date": "nextRenewalDate",
  renewal: "nextRenewalDate",
  next_renewal_date: "nextRenewalDate",
  "next renewal date": "nextRenewalDate",
  "due date": "nextRenewalDate",
  // Category
  category: "categoryName",
  type: "categoryName",
  group: "categoryName",
  // Start Date
  "start date": "startDate",
  start_date: "startDate",
  started: "startDate",
  created: "startDate",
  // Status
  status: "status",
  state: "status",
  active: "status",
};

export function detectColumnMapping(
  headers: Readonly<string[]>,
): Record<string, TrackrField | null> {
  const result: Record<string, TrackrField | null> = {};
  for (const header of headers) {
    const normalized = header.toLowerCase().trim();
    result[header] = ALIAS_MAP[normalized] ?? null;
  }
  return result;
}
