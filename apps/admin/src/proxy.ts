import { NextResponse, NextRequest } from "next/server";

// Mirrors packages/api/src/session-keys.ts. Not imported from there: this
// file avoids @mcc/api's barrel, which pulls in axios via a side-effecting
// `import "./interceptors"` -- unrelated overhead for a proxy that only
// needs one cookie-name string. Keep both in sync if the naming scheme
// changes.
const AUTH_COOKIE = `mcc_${process.env.NEXT_PUBLIC_APP_ID || "default"}_auth`;

// Where a signed-in admin belongs instead of the sign-in form.
const SIGNED_OUT_ONLY = ["/", "/login"];

export function proxy(req: NextRequest) {
  const auth = req.cookies.get(AUTH_COOKIE);
  const signedOutOnly = SIGNED_OUT_ONLY.includes(req.nextUrl.pathname);

  // A signed-in admin opening the console's root (or a bookmarked /login) was
  // shown the login form: app/page.tsx redirects to /login unconditionally
  // and nothing sent a live session onwards. The session was intact, but it
  // looked exactly like being logged out. The learner, teacher and parent
  // apps already route this way.
  if (signedOutOnly) {
    return auth ? NextResponse.redirect(new URL("/dashboard", req.url)) : NextResponse.next();
  }

  if (!auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    // "/courses/:path*" matched nothing -- courses only exists at
    // /dashboard/courses, never at top-level /courses. /finance,
    // /messaging, /settings are real top-level (admin) siblings of
    // /dashboard that weren't gated at all before this fix --
    // platform-completion-plan.md Phase 8.0.
    "/finance/:path*",
    "/messaging/:path*",
    "/settings/:path*",
    // Real top-level sibling added in platform-completion-plan.md Phase 8.4.2.
    "/moderation/:path*",
  ],
};
