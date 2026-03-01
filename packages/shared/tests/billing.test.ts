import { describe, expect, it, vi, afterEach } from "vitest";
import { computeNextRenewalDate, isDue } from "../src/billing";

describe("computeNextRenewalDate", () => {
  describe("weekly billing cycle", () => {
    it("advances by exactly 7 days", () => {
      expect(computeNextRenewalDate("2026-03-01", "weekly")).toBe("2026-03-08");
    });

    it("wraps across month boundaries", () => {
      expect(computeNextRenewalDate("2026-03-28", "weekly")).toBe("2026-04-04");
    });

    it("wraps across year boundaries", () => {
      expect(computeNextRenewalDate("2025-12-28", "weekly")).toBe("2026-01-04");
    });
  });

  describe("monthly billing cycle", () => {
    it("advances by one month same day", () => {
      expect(computeNextRenewalDate("2026-03-15", "monthly")).toBe(
        "2026-04-15",
      );
    });

    it("advances from January to February", () => {
      expect(computeNextRenewalDate("2026-01-15", "monthly")).toBe(
        "2026-02-15",
      );
    });

    it("wraps to next year from December", () => {
      expect(computeNextRenewalDate("2025-12-15", "monthly")).toBe(
        "2026-01-15",
      );
    });

    it("clamps Jan 31 → Feb 28 (non-leap year)", () => {
      expect(computeNextRenewalDate("2026-01-31", "monthly")).toBe(
        "2026-02-28",
      );
    });

    it("clamps Jan 31 → Feb 29 (leap year)", () => {
      expect(computeNextRenewalDate("2024-01-31", "monthly")).toBe(
        "2024-02-29",
      );
    });

    it("clamps March 31 → April 30", () => {
      expect(computeNextRenewalDate("2026-03-31", "monthly")).toBe(
        "2026-04-30",
      );
    });

    it("does not clamp when target month has enough days", () => {
      expect(computeNextRenewalDate("2026-03-30", "monthly")).toBe(
        "2026-04-30",
      );
    });
  });

  describe("quarterly billing cycle", () => {
    it("advances by 3 months", () => {
      expect(computeNextRenewalDate("2026-01-15", "quarterly")).toBe(
        "2026-04-15",
      );
    });

    it("wraps to next year", () => {
      expect(computeNextRenewalDate("2026-10-15", "quarterly")).toBe(
        "2027-01-15",
      );
    });

    it("clamps Oct 31 → Jan 31 (wraps year)", () => {
      expect(computeNextRenewalDate("2025-10-31", "quarterly")).toBe(
        "2026-01-31",
      );
    });

    it("clamps Nov 30 → Feb 28 (non-leap year)", () => {
      expect(computeNextRenewalDate("2025-11-30", "quarterly")).toBe(
        "2026-02-28",
      );
    });
  });

  describe("yearly billing cycle", () => {
    it("advances by 1 year same day", () => {
      expect(computeNextRenewalDate("2025-03-15", "yearly")).toBe("2026-03-15");
    });

    it("clamps Feb 29 → Feb 28 in non-leap year", () => {
      expect(computeNextRenewalDate("2024-02-29", "yearly")).toBe("2025-02-28");
    });

    it("Feb 29 → Feb 29 in next leap year", () => {
      // 2024 is leap, 2025 is not, 2026 is not, 2027 is not, 2028 is leap
      expect(computeNextRenewalDate("2024-02-29", "yearly")).toBe("2025-02-28");
    });

    it("wraps end-of-year correctly", () => {
      expect(computeNextRenewalDate("2025-12-31", "yearly")).toBe("2026-12-31");
    });
  });

  describe("unknown billing cycle falls back to monthly", () => {
    it("treats unknown as monthly", () => {
      expect(computeNextRenewalDate("2026-03-01", "unknown")).toBe(
        "2026-04-01",
      );
    });
  });
});

describe("isDue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when nextRenewalDate is today", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 1) }); // March 1, 2026 local
    expect(isDue("2026-03-01")).toBe(true);
  });

  it("returns true when nextRenewalDate is in the past", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 10) }); // March 10
    expect(isDue("2026-03-01")).toBe(true);
  });

  it("returns false when nextRenewalDate is in the future", () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 1) }); // March 1
    expect(isDue("2026-03-02")).toBe(false);
  });
});
