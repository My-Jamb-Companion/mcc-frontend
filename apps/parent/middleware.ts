import { NextResponse, NextRequest } from "next/server";

// Mirrors packages/api/src/session-keys.ts. Not imported from there: this
// file runs in the Next.js Edge Runtime, which can't load @mcc/api's barrel
// (it pulls in axios via a side-effecting `import "./interceptors"`, and
// axios's Node http adapter isn't Edge-Runtime-safe). Keep both in sync if
// the naming scheme changes.
const AUTH_COOKIE = `mcc_${process.env.NEXT_PUBLIC_APP_ID || "default"}_auth`;

const AUTH_PAGES = ["/login", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const auth = req.cookies.get(AUTH_COOKIE);

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Authenticated user landing on an auth page → send to the child list.
  if (auth && isAuthPage) {
    return NextResponse.redirect(new URL("/children", req.url));
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
    "/signup",
    "/children/:path*",
    "/notifications/:path*",
  ],
};
