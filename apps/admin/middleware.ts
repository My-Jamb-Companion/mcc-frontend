import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.cookies.get("mcc_auth");

  if (!auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*"],
};
