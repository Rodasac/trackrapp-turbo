export interface FuzzyMatchResult {
  matchId: number | null;
  matchName: string | null;
  confidence: "exact" | "fuzzy" | "none";
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] =
          1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
      }
    }
  }
  return dp[m]![n]!;
}

export function fuzzyMatchService(
  name: string,
  catalog: { id: number; name: string }[],
): FuzzyMatchResult {
  const normalized = name.toLowerCase().trim();

  // 1. Exact match (case-insensitive)
  for (const item of catalog) {
    if (item.name.toLowerCase().trim() === normalized) {
      return { matchId: item.id, matchName: item.name, confidence: "exact" };
    }
  }

  // 2. Includes check: input contains catalog name or vice versa
  for (const item of catalog) {
    const catalogNorm = item.name.toLowerCase().trim();
    if (normalized.includes(catalogNorm) || catalogNorm.includes(normalized)) {
      return { matchId: item.id, matchName: item.name, confidence: "fuzzy" };
    }
  }

  // 3. Levenshtein distance ≤ 2
  for (const item of catalog) {
    const catalogNorm = item.name.toLowerCase().trim();
    if (levenshtein(normalized, catalogNorm) <= 2) {
      return { matchId: item.id, matchName: item.name, confidence: "fuzzy" };
    }
  }

  return { matchId: null, matchName: null, confidence: "none" };
}
