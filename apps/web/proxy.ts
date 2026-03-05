import createMiddleware from "next-intl/middleware";
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
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

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

// Strip non-default locale prefix so auth checks work for all locales.
// e.g. /es/dashboard → /dashboard (Spanish prefix removed)
function stripLocale(pathname: string): string {
  const nonDefaultLocales = routing.locales.filter(
    (l) => l !== routing.defaultLocale,
  );
  if (nonDefaultLocales.length === 0) return pathname;
  const pattern = new RegExp(`^/(${nonDefaultLocales.join("|")})(\/|$)`); // eslint-disable-line no-useless-escape
  return pathname.replace(pattern, "/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // Layer 2: API-level rate limiting (all /api routes except exempt paths)
  // Disabled during Playwright E2E runs to avoid spurious 429s.
  // Better Auth handles /api/auth/* with its own rate limiter (Layer 1).
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/api") && process.env.PLAYWRIGHT !== "true") {
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
  // Locale routing — let next-intl detect/redirect locale for page routes
  // ---------------------------------------------------------------------------
  const intlResponse = intlMiddleware(request);

  // If next-intl wants to redirect (e.g. locale normalisation), honour it
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // ---------------------------------------------------------------------------
  // Page-level auth logic
  // Strip any locale prefix before matching protected/auth paths.
  // ---------------------------------------------------------------------------
  const strippedPathname = stripLocale(pathname);
  const isProtected = PROTECTED_PATHS.some((p) =>
    strippedPathname.startsWith(p),
  );
  const isAuthPage = AUTH_PATHS.some((p) => strippedPathname.startsWith(p));

  if (!isProtected && !isAuthPage) return intlResponse;

  const session = await auth.api.getSession({ headers: request.headers });

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", strippedPathname);
    return NextResponse.redirect(loginUrl);
  }

  // Return the intl response so locale headers/cookies are preserved
  return intlResponse;
}

export const config = {
  // Include /api routes (rate limiting). Exclude static files/Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
