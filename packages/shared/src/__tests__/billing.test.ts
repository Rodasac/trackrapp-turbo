import { describe, it, expect } from "vitest";
import { toMonthlyRate } from "../billing";

describe("toMonthlyRate", () => {
  it("returns price unchanged for monthly", () => {
    expect(toMonthlyRate(10, "monthly")).toBe(10);
  });

  it("divides by 12 for yearly", () => {
    expect(toMonthlyRate(120, "yearly")).toBeCloseTo(10);
  });

  it("divides by 3 for quarterly", () => {
    expect(toMonthlyRate(30, "quarterly")).toBeCloseTo(10);
  });

  it("multiplies by 52/12 for weekly", () => {
    expect(toMonthlyRate(10, "weekly")).toBeCloseTo((10 * 52) / 12);
  });

  it("returns price unchanged for unknown cycle", () => {
    expect(toMonthlyRate(10, "biennial")).toBe(10);
  });

  it("handles zero price", () => {
    expect(toMonthlyRate(0, "yearly")).toBe(0);
  });
});
