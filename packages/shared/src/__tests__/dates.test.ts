import { describe, it, expect } from "vitest";
import { parseDateString, toDateString } from "../dates";

describe("parseDateString", () => {
  it("parses a standard date string", () => {
    const d = parseDateString("2026-03-15");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // 0-indexed
    expect(d.getDate()).toBe(15);
  });

  it("parses a leap day", () => {
    const d = parseDateString("2024-02-29");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(29);
  });

  it("parses year boundary dates correctly", () => {
    const d = parseDateString("2025-12-31");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(11);
    expect(d.getDate()).toBe(31);
  });

  it("uses local (not UTC) time components", () => {
    // new Date("2026-01-01") shifts to Dec 31 in UTC-N timezones
    // parseDateString must return local midnight
    const d = parseDateString("2026-01-01");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(1);
  });
});

describe("toDateString", () => {
  it("zero-pads month and day", () => {
    const d = new Date(2026, 0, 5); // Jan 5
    expect(toDateString(d)).toBe("2026-01-05");
  });

  it("handles year boundary", () => {
    const d = new Date(2025, 11, 31); // Dec 31
    expect(toDateString(d)).toBe("2025-12-31");
  });

  it("roundtrips with parseDateString", () => {
    const original = "2026-07-04";
    expect(toDateString(parseDateString(original))).toBe(original);
  });
});
