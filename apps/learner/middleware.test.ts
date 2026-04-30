import { describe, it, expect } from "vitest";
import { middleware } from "./middleware";
import { NextRequest } from "next/server";

// ─── helper: build a NextRequest with optional cookies ───────────────────────
function makeRequest(path: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(`http://localhost${path}`);
  Object.entries(cookies).forEach(([k, v]) => req.cookies.set(k, v));
  return req;
}

// ─── helper: get redirect location from response ─────────────────────────────
function getRedirect(res: ReturnType<typeof middleware>) {
  return res.headers.get("location");
}

// ─────────────────────────────────────────────────────────────────────────────
// Unauthenticated user — no mcc_auth cookie
// ─────────────────────────────────────────────────────────────────────────────
describe("unauthenticated user", () => {
  // TC-9.1
  it("redirects from /dashboard to /login", () => {
    const res = middleware(makeRequest("/dashboard"));
    expect(getRedirect(res)).toContain("/login");
  });

  // TC-9.6
  it("allows access to /login", () => {
    const res = middleware(makeRequest("/login"));
    expect(getRedirect(res)).toBeNull();
  });

  // TC-9.7
  it("allows access to /signup", () => {
    const res = middleware(makeRequest("/signup"));
    expect(getRedirect(res)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated user — has mcc_auth cookie
// ─────────────────────────────────────────────────────────────────────────────
describe("authenticated user", () => {
  // TC-9.2
  it("redirects from /login to /dashboard", () => {
    const res = middleware(makeRequest("/login", { mcc_auth: "1" }));
    expect(getRedirect(res)).toContain("/dashboard");
  });

  // TC-9.3
  it("redirects from /signup to /dashboard", () => {
    const res = middleware(makeRequest("/signup", { mcc_auth: "1" }));
    expect(getRedirect(res)).toContain("/dashboard");
  });

  // TC-9.4
  it("redirects from /forget-password to /dashboard", () => {
    const res = middleware(makeRequest("/forget-password", { mcc_auth: "1" }));
    expect(getRedirect(res)).toContain("/dashboard");
  });

  // TC-9.5
  it("allows access to /dashboard without redirecting", () => {
    const res = middleware(makeRequest("/dashboard", { mcc_auth: "1" }));
    expect(getRedirect(res)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Google OAuth pending flow
// ─────────────────────────────────────────────────────────────────────────────
describe("google oauth pending", () => {
  // TC-9.8
  it("redirects to /auth/google/success and deletes the pending cookie", () => {
    const res = middleware(
      makeRequest("/dashboard", { google_oauth_pending: "1" }),
    );

    expect(getRedirect(res)).toContain("/auth/google/success");

    // cookie should be deleted in the response
    const deletedCookie = res.cookies.get("google_oauth_pending");
    expect(deletedCookie?.value).toBeFalsy();
  });
});
