import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

// ---------------------------------------------------------------------------
// Tier configuration
// ---------------------------------------------------------------------------

export const TIERS = {
  STRICT: { points: 5, duration: 60 }, // handled by Better Auth — not used in proxy
  MODERATE: { points: 30, duration: 60 }, // POST/PUT/PATCH/DELETE on API routes
  RELAXED: { points: 120, duration: 60 }, // GET on API routes
} as const;

// ---------------------------------------------------------------------------
// Limiter singletons
// ---------------------------------------------------------------------------

export const moderateLimiter = new RateLimiterMemory({
  points: TIERS.MODERATE.points,
  duration: TIERS.MODERATE.duration,
  blockDuration: 60, // block for 1 minute after exhausting points
});

export const relaxedLimiter = new RateLimiterMemory({
  points: TIERS.RELAXED.points,
  duration: TIERS.RELAXED.duration,
  // No block for relaxed tier — just reject for the remainder of the window
});

// ---------------------------------------------------------------------------
// Exempt paths — these bypass proxy-level rate limiting entirely
// ---------------------------------------------------------------------------

const EXEMPT_PREFIXES = [
  "/api/health",
  "/api/uploadthing",
  "/api/auth",
  "/api/test",
];

export type RateLimitTier = "MODERATE" | "RELAXED";

export type ResolveTierResult =
  | { exempt: true }
  | { exempt: false; tier: RateLimitTier; limiter: RateLimiterMemory };

/**
 * Determine which rate-limit tier applies to a given request.
 * Returns `{ exempt: true }` for paths that should not be rate-limited at the proxy layer.
 */
export function resolveTier(
  pathname: string,
  method: string,
): ResolveTierResult {
  if (EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return { exempt: true };
  }

  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(
    method.toUpperCase(),
  );

  if (isMutation) {
    return { exempt: false, tier: "MODERATE", limiter: moderateLimiter };
  }

  return { exempt: false, tier: "RELAXED", limiter: relaxedLimiter };
}

// ---------------------------------------------------------------------------
// Key extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extract the client IP from trusted proxy headers.
 * Traefik sets x-forwarded-for with the real client IP as the first entry.
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  const xri = headers.get("x-real-ip");
  if (xri?.trim()) return xri.trim();

  return "unknown";
}

const SESSION_COOKIE = "better-auth.session_token";
const KEY_PREFIX_LEN = 16;

/**
 * Build a rate-limit key for the request.
 * Uses the first 16 chars of the session cookie token when available,
 * so authenticated users share a per-session bucket regardless of IP.
 * Falls back to IP for unauthenticated requests.
 */
export function getRateLimitKey(headers: Headers): string {
  const cookieHeader = headers.get("cookie") ?? "";

  // Parse the specific cookie without a full cookie parser
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`),
  );

  if (match?.[1]) {
    const token = match[1];
    return `sess:${token.slice(0, KEY_PREFIX_LEN)}`;
  }

  return `ip:${getClientIp(headers)}`;
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/**
 * Build X-RateLimit-* headers to attach to a successful response.
 */
export function rateLimitHeaders(
  res: RateLimiterRes,
  config: { points: number; duration: number },
): Record<string, string> {
  const resetAt =
    Math.ceil(Date.now() / 1000) + Math.ceil(res.msBeforeNext / 1000);
  return {
    "X-RateLimit-Limit": String(config.points),
    "X-RateLimit-Remaining": String(Math.max(0, res.remainingPoints)),
    "X-RateLimit-Reset": String(resetAt),
  };
}

/**
 * Build a 429 JSON response with Retry-After and X-RateLimit-* headers.
 */
export function rateLimitedResponse(
  res: RateLimiterRes,
  config: { points: number; duration: number },
): Response {
  const retryAfter = Math.ceil(res.msBeforeNext / 1000);
  const resetAt = Math.ceil(Date.now() / 1000) + retryAfter;

  console.warn("[rate-limit] 429 — retryAfter:", retryAfter);

  return new Response(
    JSON.stringify({ error: "Too many requests", retryAfter }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(config.points),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(resetAt),
      },
    },
  );
}

// Re-export for instanceof checks in proxy
export { RateLimiterRes };
