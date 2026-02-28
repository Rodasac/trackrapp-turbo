import { describe, it, expect } from "vitest";
import { parseCsv } from "../csv";
import { generateCsv } from "../csv";

describe("parseCsv", () => {
  it("parses a simple CSV string", () => {
    const result = parseCsv("Name,Price\nNetflix,15.99");
    expect(result.headers).toEqual(["Name", "Price"]);
    expect(result.rows).toEqual([["Netflix", "15.99"]]);
  });

  it("handles quoted fields", () => {
    const result = parseCsv('Name,Notes\nNetflix,"Great service"');
    expect(result.headers).toEqual(["Name", "Notes"]);
    expect(result.rows).toEqual([["Netflix", "Great service"]]);
  });

  it("handles commas inside quoted fields", () => {
    const result = parseCsv('Name,Category\n"Smith, John",Personal');
    expect(result.rows).toEqual([["Smith, John", "Personal"]]);
  });

  it("handles embedded double quotes (RFC 4180 doubling)", () => {
    const result = parseCsv('Quote\n"He said ""hello"""');
    expect(result.rows).toEqual([['He said "hello"']]);
  });

  it("strips UTF-8 BOM from the start", () => {
    const result = parseCsv("\uFEFFName,Price\nSpotify,9.99");
    expect(result.headers).toEqual(["Name", "Price"]);
    expect(result.rows).toEqual([["Spotify", "9.99"]]);
  });

  it("trims whitespace from unquoted fields", () => {
    const result = parseCsv("Name , Price \n Netflix , 15.99 ");
    expect(result.headers).toEqual(["Name", "Price"]);
    expect(result.rows).toEqual([["Netflix", "15.99"]]);
  });

  it("skips empty rows", () => {
    const result = parseCsv("Name,Price\nNetflix,15.99\n\nSpotify,9.99");
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(["Netflix", "15.99"]);
    expect(result.rows[1]).toEqual(["Spotify", "9.99"]);
  });

  it("handles Windows CRLF line endings", () => {
    const result = parseCsv("Name,Price\r\nNetflix,15.99\r\nSpotify,9.99");
    expect(result.headers).toEqual(["Name", "Price"]);
    expect(result.rows).toEqual([
      ["Netflix", "15.99"],
      ["Spotify", "9.99"],
    ]);
  });

  it("round-trips with generateCsv", () => {
    const headers = ["Name", "Price", "Notes"];
    const rows = [
      ["Netflix", "15.99", 'Includes "4K"'],
      ["Spotify", "9.99", "Music, Podcasts"],
    ];
    const csv = generateCsv(headers, rows);
    const parsed = parseCsv(csv);
    expect(parsed.headers).toEqual(headers);
    expect(parsed.rows).toEqual(rows);
  });
});
