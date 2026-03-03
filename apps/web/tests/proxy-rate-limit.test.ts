/**
 * Proxy integration tests — rate limiting behaviour.
 *
 * Strategy:
 * - Mock @/lib/auth to control session presence.
 * - Mock @/lib/rate-limit to control tier + limiter responses.
 * - Use real NextRequest / NextResponse from next/server.
 * - RateLimiterRes imported directly so instanceof checks work.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { RateLimiterRes } from "rate-limiter-flexible";

// ---------------------------------------------------------------------------
// Mocks — must be hoisted before imports that use them
// ---------------------------------------------------------------------------

const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: {
    api: { getSession: (...args: unknown[]) => mockGetSession(...args) },
  },
}));

const mockResolveTier = vi.fn();
const mockGetRateLimitKey = vi.fn();
const mockRateLimitHeaders = vi.fn();
const mockRateLimitedResponse = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  TIERS: {
    MODERATE: { points: 30, duration: 60 },
    RELAXED: { points: 120, duration: 60 },
  },
  resolveTier: (...args: unknown[]) => mockResolveTier(...args),
  getRateLimitKey: (...args: unknown[]) => mockGetRateLimitKey(...args),
  rateLimitHeaders: (...args: unknown[]) => mockRateLimitHeaders(...args),
  rateLimitedResponse: (...args: unknown[]) => mockRateLimitedResponse(...args),
}));

// Import proxy AFTER mocks are declared
import { proxy } from "@/proxy";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
  path: string,
  method = "GET",
  extraHeaders: Record<string, string> = {},
): NextRequest {
  const url = `http://localhost${path}`;
  return new NextRequest(url, { method, headers: extraHeaders });
}

function makeRateLimiterRes(msBeforeNext = 30000): RateLimiterRes {
  // RateLimiterRes constructor: (remainingPoints, msBeforeNext, consumedPoints, isFirstInDuration)
  return new RateLimiterRes(0, msBeforeNext, 30, false);
}

function mockExempt() {
  mockResolveTier.mockReturnValue({ exempt: true });
}

function mockAllowed(tier: "MODERATE" | "RELAXED" = "RELAXED") {
  const mockLimiter = {
    consume: vi
      .fn()
      .mockResolvedValue(
        new RateLimiterRes(tier === "RELAXED" ? 119 : 29, 60000, 1, false),
      ),
  };
  mockResolveTier.mockReturnValue({
    exempt: false,
    tier,
    limiter: mockLimiter,
  });
  mockGetRateLimitKey.mockReturnValue("ip:1.2.3.4");
  mockRateLimitHeaders.mockReturnValue({
    "X-RateLimit-Limit": tier === "RELAXED" ? "120" : "30",
    "X-RateLimit-Remaining": tier === "RELAXED" ? "119" : "29",
    "X-RateLimit-Reset": "9999999999",
  });
  return mockLimiter;
}

function mockExceeded(tier: "MODERATE" | "RELAXED" = "RELAXED") {
  const rateLimiterRes = makeRateLimiterRes();
  const mockLimiter = {
    consume: vi.fn().mockRejectedValue(rateLimiterRes),
  };
  mockResolveTier.mockReturnValue({
    exempt: false,
    tier,
    limiter: mockLimiter,
  });
  mockGetRateLimitKey.mockReturnValue("ip:1.2.3.4");
  const mock429 = new Response(
    JSON.stringify({ error: "Too many requests", retryAfter: 30 }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "30",
        "X-RateLimit-Limit": tier === "RELAXED" ? "120" : "30",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "9999999999",
      },
    },
  );
  mockRateLimitedResponse.mockReturnValue(mock429);
  return { mockLimiter, rateLimiterRes };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("proxy — API rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- Exempt paths --------------------------------------------------------

  it("passes /api/health through without consuming points", async () => {
    mockExempt();
    const req = makeRequest("/api/health");
    const res = await proxy(req);
    expect(res.status).toBe(200); // NextResponse.next() returns 200
    expect(mockResolveTier).toHaveBeenCalledWith("/api/health", "GET");
    expect(mockGetRateLimitKey).not.toHaveBeenCalled();
  });

  it("passes /api/auth/* through without consuming points", async () => {
    mockExempt();
    const req = makeRequest("/api/auth/sign-in/email", "POST");
    const res = await proxy(req);
    expect(res.status).toBe(200);
    expect(mockGetRateLimitKey).not.toHaveBeenCalled();
  });

  it("passes /api/uploadthing through without consuming points", async () => {
    mockExempt();
    const req = makeRequest("/api/uploadthing", "POST");
    const res = await proxy(req);
    expect(res.status).toBe(200);
    expect(mockGetRateLimitKey).not.toHaveBeenCalled();
  });

  it("passes /api/test/* through without consuming points", async () => {
    mockExempt();
    const req = makeRequest("/api/test/reset", "DELETE");
    const res = await proxy(req);
    expect(res.status).toBe(200);
    expect(mockGetRateLimitKey).not.toHaveBeenCalled();
  });

  // ---- Successful API requests (with headers) ------------------------------

  it("injects X-RateLimit-* headers on successful GET /api/subscriptions", async () => {
    mockAllowed("RELAXED");
    const req = makeRequest("/api/subscriptions");
    const res = await proxy(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("120");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("119");
    expect(res.headers.get("X-RateLimit-Reset")).toBe("9999999999");
  });

  it("injects X-RateLimit-* headers on successful POST /api/subscriptions", async () => {
    mockAllowed("MODERATE");
    const req = makeRequest("/api/subscriptions", "POST");
    const res = await proxy(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("30");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("29");
  });

  // ---- Rate limit exceeded → 429 -----------------------------------------

  it("returns 429 when RELAXED limit exceeded for GET", async () => {
    mockExceeded("RELAXED");
    const req = makeRequest("/api/subscriptions");
    const res = await proxy(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body).toEqual({ error: "Too many requests", retryAfter: 30 });
    expect(res.headers.get("Retry-After")).toBe("30");
  });

  it("returns 429 when MODERATE limit exceeded for POST", async () => {
    mockExceeded("MODERATE");
    const req = makeRequest("/api/subscriptions", "POST");
    const res = await proxy(req);
    expect(res.status).toBe(429);
    expect(mockRateLimitedResponse).toHaveBeenCalledTimes(1);
  });

  // ---- Fail-open policy ---------------------------------------------------

  it("allows request through when limiter.consume() throws unexpected error", async () => {
    const mockLimiter = {
      consume: vi.fn().mockRejectedValue(new Error("Redis connection failed")),
    };
    mockResolveTier.mockReturnValue({
      exempt: false,
      tier: "RELAXED",
      limiter: mockLimiter,
    });
    mockGetRateLimitKey.mockReturnValue("ip:1.2.3.4");

    const req = makeRequest("/api/subscriptions");
    const res = await proxy(req);
    // Fail-open: request passes through with 200
    expect(res.status).toBe(200);
    expect(mockRateLimitedResponse).not.toHaveBeenCalled();
  });

  // ---- Rate limit key extraction ------------------------------------------

  it("uses session cookie as rate limit key when present", async () => {
    mockAllowed("RELAXED");
    mockGetRateLimitKey.mockReturnValue("sess:abcdefghij123456");
    const req = makeRequest("/api/subscriptions", "GET", {
      cookie: "better-auth.session_token=abcdefghij123456_extradata",
    });
    await proxy(req);
    expect(mockGetRateLimitKey).toHaveBeenCalledWith(req.headers);
  });

  it("falls back to IP when no session cookie", async () => {
    mockAllowed("RELAXED");
    mockGetRateLimitKey.mockReturnValue("ip:9.9.9.9");
    const req = makeRequest("/api/subscriptions", "GET", {
      "x-forwarded-for": "9.9.9.9",
    });
    await proxy(req);
    expect(mockGetRateLimitKey).toHaveBeenCalledWith(req.headers);
  });
});

// ---------------------------------------------------------------------------
// Regression tests: page-level auth logic unchanged
// ---------------------------------------------------------------------------

describe("proxy — page auth logic (regression)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Pages are not /api — resolveTier won't be called
  });

  it("redirects unauthenticated users from protected pages to /login", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("/dashboard");
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toMatch(/\/login/);
    expect(mockResolveTier).not.toHaveBeenCalled();
  });

  it("preserves callbackUrl in redirect", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = makeRequest("/subscriptions/123");
    const res = await proxy(req);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("callbackUrl=%2Fsubscriptions%2F123");
  });

  it("redirects authenticated users away from /login to /dashboard", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1" } });
    const req = makeRequest("/login");
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toMatch(/\/dashboard/);
  });

  it("allows authenticated users to access protected pages", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "u1" } });
    const req = makeRequest("/dashboard");
    const res = await proxy(req);
    expect(res.status).toBe(200);
  });

  it("allows unauthenticated access to non-protected, non-auth pages", async () => {
    const req = makeRequest("/pricing");
    const res = await proxy(req);
    expect(res.status).toBe(200);
    expect(mockGetSession).not.toHaveBeenCalled();
  });
});
