import { describe, it, expect } from "vitest";
import { detectColumnMapping, TRACKR_EXPORT_HEADERS } from "../column-detect";

describe("detectColumnMapping", () => {
  it("maps TrackrApp export headers exactly", () => {
    const mapping = detectColumnMapping(TRACKR_EXPORT_HEADERS);
    expect(mapping["Name"]).toBe("name");
    expect(mapping["Price"]).toBe("price");
    expect(mapping["Currency"]).toBe("currency");
    expect(mapping["Billing Cycle"]).toBe("billingCycle");
    expect(mapping["Next Renewal"]).toBe("nextRenewalDate");
    expect(mapping["Category"]).toBe("categoryName");
    expect(mapping["Start Date"]).toBe("startDate");
    expect(mapping["Status"]).toBe("status");
  });

  it("maps common aliases case-insensitively", () => {
    const mapping = detectColumnMapping(["SERVICE", "AMOUNT", "FREQUENCY", "DUE DATE"]);
    expect(mapping["SERVICE"]).toBe("name");
    expect(mapping["AMOUNT"]).toBe("price");
    expect(mapping["FREQUENCY"]).toBe("billingCycle");
    expect(mapping["DUE DATE"]).toBe("nextRenewalDate");
  });

  it("returns null for unknown headers", () => {
    const mapping = detectColumnMapping(["FooBar", "Baz"]);
    expect(mapping["FooBar"]).toBeNull();
    expect(mapping["Baz"]).toBeNull();
  });

  it("handles empty headers array", () => {
    const mapping = detectColumnMapping([]);
    expect(Object.keys(mapping)).toHaveLength(0);
  });

  it("maps 'vendor' to name field", () => {
    const mapping = detectColumnMapping(["vendor"]);
    expect(mapping["vendor"]).toBe("name");
  });

  it("maps 'billing_cycle' (underscore) to billingCycle", () => {
    const mapping = detectColumnMapping(["billing_cycle"]);
    expect(mapping["billing_cycle"]).toBe("billingCycle");
  });
});
