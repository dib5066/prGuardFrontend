import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16: this file convention is `proxy` (was `middleware`).
// Edge gate for PAGE navigations only — /api/* is excluded (it's proxied to
// the backend, which validates the session itself and returns 401).

const PUBLIC_PATHS = ["/login", "/register"];
const SESSION_COOKIE = "prguard_session";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(SESSION_COOKIE);

  if (PUBLIC_PATHS.includes(pathname)) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  // Exclude API routes, Next internals, and any file with an extension.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
