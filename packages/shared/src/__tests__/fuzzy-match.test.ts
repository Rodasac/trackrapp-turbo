import { describe, it, expect } from "vitest";
import { fuzzyMatchService } from "../fuzzy-match";

const catalog = [
  { id: 1, name: "Netflix" },
  { id: 2, name: "Spotify" },
  { id: 3, name: "Amazon Prime" },
  { id: 4, name: "Disney+" },
];

describe("fuzzyMatchService", () => {
  it("returns exact match with confidence 'exact'", () => {
    const result = fuzzyMatchService("Netflix", catalog);
    expect(result.matchId).toBe(1);
    expect(result.matchName).toBe("Netflix");
    expect(result.confidence).toBe("exact");
  });

  it("matches case-insensitively as exact", () => {
    const result = fuzzyMatchService("netflix", catalog);
    expect(result.matchId).toBe(1);
    expect(result.confidence).toBe("exact");
  });

  it("matches partial name (includes check) as fuzzy", () => {
    const result = fuzzyMatchService("Netflix Premium", catalog);
    expect(result.matchId).toBe(1);
    expect(result.confidence).toBe("fuzzy");
  });

  it("matches Levenshtein-close name as fuzzy", () => {
    const result = fuzzyMatchService("Spottify", catalog);
    expect(result.matchId).toBe(2);
    expect(result.matchName).toBe("Spotify");
    expect(result.confidence).toBe("fuzzy");
  });

  it("returns no match for unrecognized service", () => {
    const result = fuzzyMatchService("SomeRandomService", catalog);
    expect(result.matchId).toBeNull();
    expect(result.matchName).toBeNull();
    expect(result.confidence).toBe("none");
  });

  it("returns no match for empty catalog", () => {
    const result = fuzzyMatchService("Netflix", []);
    expect(result.matchId).toBeNull();
    expect(result.confidence).toBe("none");
  });

  it("handles catalog item with suffix - 'Amazon' matches 'Amazon Prime'", () => {
    const result = fuzzyMatchService("Amazon", catalog);
    // "Amazon" is contained in "Amazon Prime" → fuzzy match
    expect(result.matchId).toBe(3);
    expect(result.confidence).toBe("fuzzy");
  });
});
