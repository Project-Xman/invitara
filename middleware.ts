import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/editor", "/account", "/admin", "/studio"];
const AUTH_ONLY_PATHS = ["/auth/login", "/auth/register", "/auth/forgot-password"];

const ROOT_DOMAIN = process.env.APP_ROOT_DOMAIN ?? "localhost";
const ENABLE_SUBDOMAINS = process.env.ENABLE_SUBDOMAINS === "true";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "static",
  "cdn",
  "mail",
  "ftp",
  "blog",
  "docs",
  "help",
  "support",
]);

function getSubdomain(host: string): string | null {
  if (!ENABLE_SUBDOMAINS) return null;
  const cleanHost = host.split(":")[0].toLowerCase();
  if (cleanHost === ROOT_DOMAIN || cleanHost === `www.${ROOT_DOMAIN}`) return null;
  if (!cleanHost.endsWith(`.${ROOT_DOMAIN}`)) return null;
  const sub = cleanHost.slice(0, -1 * (`.${ROOT_DOMAIN}`).length);
  if (!sub || sub.includes(".")) return null;
  if (RESERVED_SUBDOMAINS.has(sub)) return null;
  return sub;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const token = request.cookies.get("invitara_token")?.value;

  // Subdomain → /invite/<subdomain> rewrite
  const sub = getSubdomain(host);
  if (sub && !pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = `/invite/${sub}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/webhooks|api/cron|api/og|g/|invite).*)"],
};
