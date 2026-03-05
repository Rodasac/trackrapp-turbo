import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  formatPrice,
  billingCycleLabel,
  formatRenewalDate,
  formatShortDate,
} from "../format";

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

  it("uses Spanish relative labels when provided", () => {
    expect(
      formatRenewalDate("2026-02-24", "es-ES", { today: "hoy" }),
    ).toContain("(hoy)");
    expect(
      formatRenewalDate("2026-02-25", "es-ES", { tomorrow: "mañana" }),
    ).toContain("(mañana)");
    expect(
      formatRenewalDate("2026-02-20", "es-ES", { overdue: "vencido" }),
    ).toContain("(vencido)");
    expect(
      formatRenewalDate("2026-03-10", "es-ES", { inDays: "en {days} días" }),
    ).toContain("(en 14 días)");
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

  it("formats a date with a different locale", () => {
    const result = formatShortDate("2026-03-15", "es-ES");
    // Spanish locale formats differently but contains the month number or name
    expect(result).toBeTruthy();
    expect(result).toContain("2026");
  });
});

describe("billingCycleLabel with custom labels", () => {
  it("returns custom label for monthly", () => {
    expect(billingCycleLabel("monthly", { monthly: "/mes" })).toBe("/mes");
  });

  it("falls back to English default when custom label not provided for that cycle", () => {
    expect(billingCycleLabel("yearly", { monthly: "/mes" })).toBe("/yr");
  });
});
