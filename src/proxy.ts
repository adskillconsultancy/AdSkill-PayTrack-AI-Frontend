// ── Next.js Edge Middleware ─────────────────────────────
// Handles authentication redirects at the edge.
// Runs before every route — checks for auth token in cookies/headers.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedPaths = [
  "/dashboard",
  "/clients",
  "/payments",
  "/tracking",
  "/reports",
  "/notifications",
  "/profile",
  "/settings",
];

// Routes only for unauthenticated users
const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // In active development, allow all requests through unless explicitly enforced
  const token = request.cookies.get("accessToken")?.value;
  const enforceAuth = process.env.NEXT_PUBLIC_ENABLE_AUTH_REDIRECT === "true";

  if (!enforceAuth) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthRoute = authPaths.some((path) => pathname.startsWith(path));

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export default proxy;
