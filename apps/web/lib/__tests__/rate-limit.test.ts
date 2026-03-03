import { describe, it, expect } from "vitest";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import {
  TIERS,
  moderateLimiter,
  relaxedLimiter,
  resolveTier,
  getClientIp,
  getRateLimitKey,
  rateLimitHeaders,
  rateLimitedResponse,
} from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeHeaders(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

// ---------------------------------------------------------------------------
// resolveTier
// ---------------------------------------------------------------------------

describe("resolveTier", () => {
  it("exempts /api/health", () => {
    expect(resolveTier("/api/health", "GET")).toEqual({ exempt: true });
  });

  it("exempts /api/uploadthing", () => {
    expect(resolveTier("/api/uploadthing", "POST")).toEqual({ exempt: true });
  });

  it("exempts /api/auth and sub-paths", () => {
    expect(resolveTier("/api/auth", "POST")).toEqual({ exempt: true });
    expect(resolveTier("/api/auth/sign-in/email", "POST")).toEqual({
      exempt: true,
    });
  });

  it("exempts /api/test routes", () => {
    expect(resolveTier("/api/test/reset", "DELETE")).toEqual({ exempt: true });
  });

  it("assigns MODERATE tier for POST mutations", () => {
    const result = resolveTier("/api/subscriptions", "POST");
    expect(result).toMatchObject({ exempt: false, tier: "MODERATE" });
  });

  it("assigns MODERATE tier for PUT mutations", () => {
    const result = resolveTier("/api/subscriptions/123", "PUT");
    expect(result).toMatchObject({ exempt: false, tier: "MODERATE" });
  });

  it("assigns MODERATE tier for PATCH mutations", () => {
    const result = resolveTier("/api/notifications/1/read", "PATCH");
    expect(result).toMatchObject({ exempt: false, tier: "MODERATE" });
  });

  it("assigns MODERATE tier for DELETE mutations", () => {
    const result = resolveTier("/api/subscriptions/123", "DELETE");
    expect(result).toMatchObject({ exempt: false, tier: "MODERATE" });
  });

  it("assigns RELAXED tier for GET requests", () => {
    const result = resolveTier("/api/subscriptions", "GET");
    expect(result).toMatchObject({ exempt: false, tier: "RELAXED" });
  });

  it("assigns RELAXED tier for GET on public routes", () => {
    const result = resolveTier("/api/platform-stats", "GET");
    expect(result).toMatchObject({ exempt: false, tier: "RELAXED" });
  });

  it("returns the moderateLimiter instance for MODERATE tier", () => {
    const result = resolveTier("/api/subscriptions", "POST");
    if (result.exempt) throw new Error("should not be exempt");
    expect(result.limiter).toBe(moderateLimiter);
  });

  it("returns the relaxedLimiter instance for RELAXED tier", () => {
    const result = resolveTier("/api/subscriptions", "GET");
    if (result.exempt) throw new Error("should not be exempt");
    expect(result.limiter).toBe(relaxedLimiter);
  });

  it("treats method case-insensitively", () => {
    expect(resolveTier("/api/subscriptions", "post")).toMatchObject({
      tier: "MODERATE",
    });
    expect(resolveTier("/api/subscriptions", "get")).toMatchObject({
      tier: "RELAXED",
    });
  });
});

// ---------------------------------------------------------------------------
// getClientIp
// ---------------------------------------------------------------------------

describe("getClientIp", () => {
  it("extracts the first IP from x-forwarded-for", () => {
    const headers = makeHeaders({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("handles a single IP in x-forwarded-for", () => {
    const headers = makeHeaders({ "x-forwarded-for": "9.9.9.9" });
    expect(getClientIp(headers)).toBe("9.9.9.9");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const headers = makeHeaders({ "x-real-ip": "10.0.0.1" });
    expect(getClientIp(headers)).toBe("10.0.0.1");
  });

  it("returns 'unknown' when no IP header is present", () => {
    const headers = makeHeaders({});
    expect(getClientIp(headers)).toBe("unknown");
  });

  it("trims whitespace from x-real-ip", () => {
    const headers = makeHeaders({ "x-real-ip": "  192.168.1.1  " });
    expect(getClientIp(headers)).toBe("192.168.1.1");
  });
});

// ---------------------------------------------------------------------------
// getRateLimitKey
// ---------------------------------------------------------------------------

describe("getRateLimitKey", () => {
  it("extracts session cookie token prefix", () => {
    const token = "abcdefghij123456789_extradata";
    const headers = makeHeaders({
      cookie: `better-auth.session_token=${token}; other=value`,
    });
    expect(getRateLimitKey(headers)).toBe("sess:abcdefghij123456");
  });

  it("falls back to IP when no session cookie", () => {
    const headers = makeHeaders({
      cookie: "other=value",
      "x-forwarded-for": "1.2.3.4",
    });
    expect(getRateLimitKey(headers)).toBe("ip:1.2.3.4");
  });

  it("falls back to IP when no cookies at all", () => {
    const headers = makeHeaders({ "x-real-ip": "5.5.5.5" });
    expect(getRateLimitKey(headers)).toBe("ip:5.5.5.5");
  });

  it("uses exactly 16 chars of the token", () => {
    const token = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const headers = makeHeaders({
      cookie: `better-auth.session_token=${token}`,
    });
    const key = getRateLimitKey(headers);
    expect(key).toBe("sess:ABCDEFGHIJKLMNOP");
    expect(key.length).toBe(5 + 16); // "sess:" + 16 chars
  });

  it("works when session_token cookie is the only cookie", () => {
    const headers = makeHeaders({
      cookie: "better-auth.session_token=tok123abc456def7xyz",
    });
    expect(getRateLimitKey(headers)).toBe("sess:tok123abc456def7");
  });

  it("works when session_token cookie appears after other cookies", () => {
    const headers = makeHeaders({
      cookie: "foo=bar; better-auth.session_token=tok123abc456def7xyz; baz=qux",
    });
    expect(getRateLimitKey(headers)).toBe("sess:tok123abc456def7");
  });
});

// ---------------------------------------------------------------------------
// rateLimitHeaders
// ---------------------------------------------------------------------------

describe("rateLimitHeaders", () => {
  it("returns correct X-RateLimit-* headers", () => {
    const fakeRes = {
      remainingPoints: 7,
      msBeforeNext: 30000, // 30 seconds
    } as Parameters<typeof rateLimitHeaders>[0];

    const config = { points: 30, duration: 60 };
    const headers = rateLimitHeaders(fakeRes, config);

    expect(headers["X-RateLimit-Limit"]).toBe("30");
    expect(headers["X-RateLimit-Remaining"]).toBe("7");
    // Reset should be roughly "now + 30s" — just verify it's a number
    expect(Number(headers["X-RateLimit-Reset"])).toBeGreaterThan(0);
  });

  it("clamps remainingPoints to 0 when negative", () => {
    const fakeRes = {
      remainingPoints: -1,
      msBeforeNext: 5000,
    } as Parameters<typeof rateLimitHeaders>[0];

    const headers = rateLimitHeaders(fakeRes, { points: 30, duration: 60 });
    expect(headers["X-RateLimit-Remaining"]).toBe("0");
  });
});

// ---------------------------------------------------------------------------
// rateLimitedResponse
// ---------------------------------------------------------------------------

describe("rateLimitedResponse", () => {
  it("returns a 429 response", () => {
    const fakeRes = {
      remainingPoints: 0,
      msBeforeNext: 42000,
    } as Parameters<typeof rateLimitedResponse>[0];

    const response = rateLimitedResponse(fakeRes, { points: 30, duration: 60 });
    expect(response.status).toBe(429);
  });

  it("includes Retry-After header", async () => {
    const fakeRes = {
      remainingPoints: 0,
      msBeforeNext: 42000,
    } as Parameters<typeof rateLimitedResponse>[0];

    const response = rateLimitedResponse(fakeRes, { points: 30, duration: 60 });
    expect(response.headers.get("Retry-After")).toBe("42");
  });

  it("includes correct body JSON", async () => {
    const fakeRes = {
      remainingPoints: 0,
      msBeforeNext: 10000,
    } as Parameters<typeof rateLimitedResponse>[0];

    const response = rateLimitedResponse(fakeRes, { points: 30, duration: 60 });
    const body = await response.json();
    expect(body).toEqual({ error: "Too many requests", retryAfter: 10 });
  });

  it("sets X-RateLimit-Remaining to 0", () => {
    const fakeRes = {
      remainingPoints: 0,
      msBeforeNext: 5000,
    } as Parameters<typeof rateLimitedResponse>[0];

    const response = rateLimitedResponse(fakeRes, { points: 30, duration: 60 });
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
  });
});

// ---------------------------------------------------------------------------
// Limiter instances — smoke test point consumption
// ---------------------------------------------------------------------------

describe("TIERS config", () => {
  it("MODERATE tier has 30 points per 60s", () => {
    expect(TIERS.MODERATE).toEqual({ points: 30, duration: 60 });
  });

  it("RELAXED tier has 120 points per 60s", () => {
    expect(TIERS.RELAXED).toEqual({ points: 120, duration: 60 });
  });
});

describe("moderateLimiter instance", () => {
  it("is a RateLimiterMemory with 30 points", () => {
    expect(moderateLimiter).toBeInstanceOf(RateLimiterMemory);
    expect(moderateLimiter.points).toBe(30);
  });

  it("allows consumption and tracks remaining points", async () => {
    const key = `test-moderate-${Math.random()}`;
    const res = await moderateLimiter.consume(key, 1);
    expect(res.remainingPoints).toBe(29);
  });

  it("rejects after exceeding 30 points", async () => {
    const key = `test-moderate-exceed-${Math.random()}`;
    // Consume all 30 points
    await moderateLimiter.consume(key, 30);
    // Next request should throw a RateLimiterRes (not an Error)
    await expect(moderateLimiter.consume(key, 1)).rejects.toBeInstanceOf(
      RateLimiterRes,
    );
  });
});

describe("relaxedLimiter instance", () => {
  it("is a RateLimiterMemory with 120 points", () => {
    expect(relaxedLimiter).toBeInstanceOf(RateLimiterMemory);
    expect(relaxedLimiter.points).toBe(120);
  });

  it("allows consumption and tracks remaining points", async () => {
    const key = `test-relaxed-${Math.random()}`;
    const res = await relaxedLimiter.consume(key, 1);
    expect(res.remainingPoints).toBe(119);
  });

  it("rejects after exceeding 120 points", async () => {
    const key = `test-relaxed-exceed-${Math.random()}`;
    await relaxedLimiter.consume(key, 120);
    await expect(relaxedLimiter.consume(key, 1)).rejects.toBeInstanceOf(
      RateLimiterRes,
    );
  });
});
