import { describe, it, expect } from "vitest";
import { proxy } from "./proxy";
import { NextRequest } from "next/server";

// ─── helper: build a NextRequest with optional cookies ───────────────────────
function makeRequest(path: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(`http://localhost${path}`);
  Object.entries(cookies).forEach(([k, v]) => req.cookies.set(k, v));
  return req;
}

// ─── helper: get redirect location from response ─────────────────────────────
function getRedirect(res: ReturnType<typeof proxy>) {
  return res.headers.get("location");
}

// ─────────────────────────────────────────────────────────────────────────────
// Unauthenticated user — no mcc_auth cookie
// ─────────────────────────────────────────────────────────────────────────────
describe("unauthenticated user", () => {
  // TC-10.1
  it("redirects from /dashboard to /login", () => {
    const res = proxy(makeRequest("/dashboard"));
    expect(getRedirect(res)).toContain("/login");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated user — has mcc_auth cookie
// ─────────────────────────────────────────────────────────────────────────────
describe("authenticated user", () => {
  // TC-10.3
  it("allows access to /dashboard", () => {
    const res = proxy(makeRequest("/dashboard", { mcc_admin_auth: "1" }));
    expect(getRedirect(res)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sign-in pages (observed 16 Sep 2026: a signed-in admin opening the root saw
// the login form with their session intact -- indistinguishable from a logout)
// ─────────────────────────────────────────────────────────────────────────────
describe("sign-in pages", () => {
  it.each(["/", "/login"])("sends a signed-in admin from %s to the dashboard", (path) => {
    const res = proxy(makeRequest(path, { mcc_admin_auth: "1" }));
    expect(getRedirect(res)).toContain("/dashboard");
  });

  it("lets a signed-out visitor reach /login without a redirect loop", () => {
    const res = proxy(makeRequest("/login"));
    expect(getRedirect(res)).toBeNull();
  });

  it("leaves the signed-out root to the page, which shows sign-in", () => {
    const res = proxy(makeRequest("/"));
    expect(getRedirect(res)).toBeNull();
  });
});
