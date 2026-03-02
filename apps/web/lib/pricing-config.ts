export const PRICING = {
  free: { monthly: 0 },
  pro: {
    monthly: 4, // dollars
    annual: 40, // dollars per year
    trialDays: 14,
  },
} as const;

// Derived values (computed once, not repeated)
export const PRO_EFFECTIVE_MONTHLY = +(PRICING.pro.annual / 12).toFixed(2); // 3.33
export const PRO_ANNUAL_DISCOUNT_PCT = Math.round(
  (1 - PRICING.pro.annual / (PRICING.pro.monthly * 12)) * 100,
); // 17

// Stripe amounts (cents) — used by stripe-setup.sh
export const STRIPE_PRO_MONTHLY_CENTS = PRICING.pro.monthly * 100; // 400
export const STRIPE_PRO_ANNUAL_CENTS = PRICING.pro.annual * 100; // 4000
