import { NextResponse, NextRequest } from "next/server";

// Mirrors packages/api/src/session-keys.ts. Not imported from there: this
// file avoids @mcc/api's barrel, which pulls in axios via a side-effecting
// `import "./interceptors"` -- unrelated overhead for a proxy that only
// needs one cookie-name string. Keep both in sync if the naming scheme
// changes.
const AUTH_COOKIE = `mcc_${process.env.NEXT_PUBLIC_APP_ID || "default"}_auth`;

const AUTH_PAGES = ["/login"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const auth = req.cookies.get(AUTH_COOKIE);

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Authenticated user landing on the login page → send to the dashboard.
  if (auth && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated user trying to reach a protected page → send to login.
  if (!auth && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/availability/:path*",
    "/messages/:path*",
    "/earnings/:path*",
    "/account/:path*",
  ],
};
