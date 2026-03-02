export interface ComparisonFeature {
  feature: string;
  free: boolean;
  pro: boolean;
}

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  { feature: "Unlimited subscriptions", free: true, pro: true },
  { feature: "Renewal reminders (email)", free: true, pro: true },
  { feature: "Basic spending dashboard", free: true, pro: true },
  { feature: "Categories & tags", free: true, pro: true },
  { feature: "CSV export", free: true, pro: true },
  { feature: "Calendar view", free: true, pro: true },
  { feature: "Dark mode", free: true, pro: true },
  { feature: "AI-powered spending tips", free: false, pro: true },
  { feature: "Push notifications", free: false, pro: true },
  { feature: "Advanced analytics", free: false, pro: true },
  { feature: "CSV import", free: false, pro: true },
  { feature: "Price comparison", free: false, pro: true },
  { feature: "Priority support", free: false, pro: true },
];
