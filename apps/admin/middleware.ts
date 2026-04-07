import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const user = req.cookies.get("user");

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*"],
};