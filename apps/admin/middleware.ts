import { NextResponse, NextRequest } from "next/server";

// Mirrors packages/api/src/session-keys.ts. Not imported from there: this
// file runs in the Next.js Edge Runtime, which can't load @mcc/api's barrel
// (it pulls in axios via a side-effecting `import "./interceptors"`, and
// axios's Node http adapter isn't Edge-Runtime-safe). Keep both in sync if
// the naming scheme changes.
const AUTH_COOKIE = `mcc_${process.env.NEXT_PUBLIC_APP_ID || "default"}_auth`;

export function middleware(req: NextRequest) {
  const auth = req.cookies.get(AUTH_COOKIE);

  if (!auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*"],
};
