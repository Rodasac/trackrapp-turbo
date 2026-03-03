import { auth } from "@/lib/auth";
import {
  resolveTier,
  getRateLimitKey,
  rateLimitHeaders,
  rateLimitedResponse,
  TIERS,
} from "@/lib/rate-limit";
import { RateLimiterRes } from "rate-limiter-flexible";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/subscriptions",
  "/notifications",
  "/tips",
  "/settings",
];

const AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/check-email",
  "/check-email-reset",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // Layer 2: API-level rate limiting (all /api routes except exempt paths)
  // Better Auth handles /api/auth/* with its own rate limiter (Layer 1).
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/api")) {
    const tierResult = resolveTier(pathname, request.method);

    if (!tierResult.exempt) {
      const key = getRateLimitKey(request.headers);
      const tierConfig =
        tierResult.tier === "MODERATE" ? TIERS.MODERATE : TIERS.RELAXED;

      try {
        const res = await tierResult.limiter.consume(key);
        const headers = rateLimitHeaders(res, tierConfig);
        const response = NextResponse.next();
        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value);
        }
        return response;
      } catch (err) {
        if (err instanceof RateLimiterRes) {
          return rateLimitedResponse(err, tierConfig);
        }
        // Fail open — unexpected limiter error should not block requests
        return NextResponse.next();
      }
    }

    // Exempt API paths pass through without consuming points
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // Page-level auth logic (unchanged)
  // ---------------------------------------------------------------------------
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAuthPage) return NextResponse.next();

  const session = await auth.api.getSession({ headers: request.headers });

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Include /api routes (for rate limiting). Exclude static files/internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
