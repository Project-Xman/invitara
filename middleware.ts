import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PATHS = ["/dashboard", "/editor", "/account", "/admin"];

// Routes only for unauthenticated users (redirect to dashboard if logged in)
const AUTH_ONLY_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("invitara_token")?.value;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  // Unauthenticated user hitting a protected route → redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting auth-only routes → redirect to dashboard
  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public API routes (/api/webhooks/*, /api/cron/*)
     * - Public invite pages (/invite/*)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/cron|invite).*)",
  ],
};
