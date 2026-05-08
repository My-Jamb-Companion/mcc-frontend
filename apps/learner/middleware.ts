import { NextResponse, NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup", "/forget-password", "/auth/google", "/auth/facebook"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const auth = req.cookies.get("mcc_auth");

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Authenticated user landing on an auth page → send to dashboard
  if (auth && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated user trying to reach a protected page → send to login
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
    "/onboarding",
    "/forget-password",
    "/auth/google/:path*",
    "/auth/facebook/:path*",
    "/dashboard/:path*",
    "/courses/:path*",
  ],
};
