import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatPrice, billingCycleLabel, formatRenewalDate, formatShortDate } from "../format.js";

describe("formatPrice", () => {
  it("formats USD price", () => {
    expect(formatPrice("9.99", "USD")).toBe("$9.99");
  });

  it("formats EUR price", () => {
    expect(formatPrice("14.99", "EUR")).toContain("14.99");
  });

  it("formats zero price", () => {
    expect(formatPrice("0", "USD")).toBe("$0.00");
  });

  it("falls back to USD when currency is empty string", () => {
    expect(formatPrice("9.99", "")).toBe("$9.99");
  });
});

describe("billingCycleLabel", () => {
  it("returns /mo for monthly", () => {
    expect(billingCycleLabel("monthly")).toBe("/mo");
  });

  it("returns /yr for yearly", () => {
    expect(billingCycleLabel("yearly")).toBe("/yr");
  });

  it("returns /wk for weekly", () => {
    expect(billingCycleLabel("weekly")).toBe("/wk");
  });

  it("returns /qtr for quarterly", () => {
    expect(billingCycleLabel("quarterly")).toBe("/qtr");
  });

  it("returns empty string for unknown cycle", () => {
    expect(billingCycleLabel("biennial")).toBe("");
  });
});

describe("formatRenewalDate", () => {
  beforeEach(() => {
    // Fix "today" to 2026-02-24
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 24)); // Feb 24, 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty string for empty input", () => {
    expect(formatRenewalDate("")).toBe("");
  });

  it("appends (overdue) for past dates", () => {
    expect(formatRenewalDate("2026-02-20")).toContain("(overdue)");
  });

  it("appends (today) for today", () => {
    expect(formatRenewalDate("2026-02-24")).toContain("(today)");
  });

  it("appends (tomorrow) for tomorrow", () => {
    expect(formatRenewalDate("2026-02-25")).toContain("(tomorrow)");
  });

  it("appends (in N days) for dates within 30 days", () => {
    expect(formatRenewalDate("2026-03-10")).toContain("(in 14 days)");
  });

  it("returns plain date for dates beyond 30 days", () => {
    const result = formatRenewalDate("2026-04-01");
    expect(result).not.toContain("(");
  });
});

describe("formatShortDate", () => {
  it("returns empty string for empty input", () => {
    expect(formatShortDate("")).toBe("");
  });

  it("formats a known date", () => {
    // Mar 15, 2026
    expect(formatShortDate("2026-03-15")).toBe("Mar 15, 2026");
  });
});
