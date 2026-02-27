import { describe, it, expect } from "vitest";
import { generateCsv } from "../csv";

describe("generateCsv", () => {
  it("generates a header row and data rows", () => {
    const result = generateCsv(["Name", "Price"], [["Netflix", "15.99"]]);
    expect(result).toBe("Name,Price\nNetflix,15.99");
  });

  it("handles multiple rows", () => {
    const result = generateCsv(
      ["Name", "Price"],
      [
        ["Netflix", "15.99"],
        ["Spotify", "9.99"],
      ],
    );
    expect(result).toBe("Name,Price\nNetflix,15.99\nSpotify,9.99");
  });

  it("escapes fields containing commas with double quotes", () => {
    const result = generateCsv(["Name"], [["Smith, John"]]);
    expect(result).toBe('Name\n"Smith, John"');
  });

  it("escapes fields containing double quotes by doubling them", () => {
    const result = generateCsv(["Quote"], [['He said "hello"']]);
    expect(result).toBe('Quote\n"He said ""hello"""');
  });

  it("escapes fields containing newlines", () => {
    const result = generateCsv(["Notes"], [["line1\nline2"]]);
    expect(result).toBe('Notes\n"line1\nline2"');
  });

  it("handles empty rows array (headers only)", () => {
    const result = generateCsv(["A", "B", "C"], []);
    expect(result).toBe("A,B,C");
  });

  it("handles empty strings in fields", () => {
    const result = generateCsv(["Name", "Category"], [["Netflix", ""]]);
    expect(result).toBe("Name,Category\nNetflix,");
  });
});
