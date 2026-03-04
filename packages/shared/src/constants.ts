export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];
