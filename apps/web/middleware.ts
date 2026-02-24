import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Use Node.js runtime so auth.api.getSession can reach the database.
export const runtime = "nodejs";

const PROTECTED_PATHS = [
  "/dashboard",
  "/subscriptions",
  "/notifications",
  "/tips",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static files, Next.js internals, and the auth API itself.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
