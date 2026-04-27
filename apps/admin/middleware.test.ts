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
  // TC-10.1
  it("redirects from /dashboard to /login", () => {
    const res = middleware(makeRequest("/dashboard"));
    expect(getRedirect(res)).toContain("/login");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated user — has mcc_auth cookie
// ─────────────────────────────────────────────────────────────────────────────
describe("authenticated user", () => {
  // TC-10.3
  it("allows access to /dashboard", () => {
    const res = middleware(makeRequest("/dashboard", { mcc_auth: "1" }));
    expect(getRedirect(res)).toBeNull();
  });
});
