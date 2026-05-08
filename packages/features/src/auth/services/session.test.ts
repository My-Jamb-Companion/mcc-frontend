import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveSession,
  clearSession,
  getStoredUser,
  getStoredRefreshToken,
} from "./session";
import { tokenManager } from "@mcc/api";
import type { User } from "@mcc/types";

// ─── mock user matching the real User interface ───────────────────────────────
const mockUser: User = {
  user_id: "user-1",
  email: "user@example.com",
  role: "student",
};

// ─── reset storage before every test ─────────────────────────────────────────
beforeEach(() => {
  localStorage.clear();
  tokenManager.clear();
  document.cookie = "mcc_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "mcc_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
});

// ─────────────────────────────────────────────────────────────────────────────
// saveSession
// ─────────────────────────────────────────────────────────────────────────────
describe("saveSession", () => {
  // TC-4.1
  it("sets the access token in tokenManager (memory)", () => {
    saveSession(mockUser, "access-tok", "refresh-tok");

    expect(tokenManager.get()).toBe("access-tok");
  });

  // TC-4.2
  it("does NOT write tokens to localStorage", () => {
    saveSession(mockUser, "access-tok", "refresh-tok");

    expect(localStorage.getItem("mcc_access_token")).toBeNull();
    expect(localStorage.getItem("mcc_refresh_token")).toBeNull();
  });

  // TC-4.3
  it("writes the user as a JSON string to localStorage", () => {
    saveSession(mockUser, "access-tok", "refresh-tok");

    const stored = JSON.parse(localStorage.getItem("mcc_user")!);
    expect(stored.user_id).toBe(mockUser.user_id);
    expect(stored.email).toBe(mockUser.email);
  });

  // TC-4.4
  it("sets the mcc_auth cookie", () => {
    saveSession(mockUser, "access-tok", "refresh-tok");

    expect(document.cookie).toContain("mcc_auth=1");
  });

  // TC-4.5
  it("stores the refresh token in a cookie", () => {
    saveSession(mockUser, "access-tok", "refresh-tok");

    expect(getStoredRefreshToken()).toBe("refresh-tok");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// clearSession
// ─────────────────────────────────────────────────────────────────────────────
describe("clearSession", () => {
  // TC-4.6
  it("removes user from localStorage and clears tokenManager", () => {
    saveSession(mockUser, "access-tok", "refresh-tok");

    clearSession();

    expect(localStorage.getItem("mcc_user")).toBeNull();
    expect(tokenManager.get()).toBeNull();
  });

  // TC-4.7
  it("expires the mcc_auth cookie", () => {
    saveSession(mockUser, "access-tok", "refresh-tok");

    clearSession();

    expect(document.cookie).not.toContain("mcc_auth=1");
  });

  // TC-4.8
  it("expires the mcc_refresh_token cookie", () => {
    saveSession(mockUser, "access-tok", "refresh-tok");

    clearSession();

    expect(getStoredRefreshToken()).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getStoredUser
// ─────────────────────────────────────────────────────────────────────────────
describe("getStoredUser", () => {
  // TC-4.9
  it("returns null when no user is stored", () => {
    expect(getStoredUser()).toBeNull();
  });

  // TC-4.10
  it("returns the parsed user object when one is stored", () => {
    localStorage.setItem("mcc_user", JSON.stringify(mockUser));

    const result = getStoredUser();

    expect(result?.user_id).toBe(mockUser.user_id);
    expect(result?.email).toBe(mockUser.email);
  });

  // TC-4.11
  it("returns null in server-side environments (window undefined)", () => {
    vi.stubGlobal("window", undefined);

    expect(getStoredUser()).toBeNull();

    vi.unstubAllGlobals();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getStoredRefreshToken
// ─────────────────────────────────────────────────────────────────────────────
describe("getStoredRefreshToken", () => {
  // TC-4.12
  it("returns null when no refresh token cookie exists", () => {
    expect(getStoredRefreshToken()).toBeNull();
  });

  // TC-4.13
  it("returns the refresh token after saveSession", () => {
    saveSession(mockUser, "access-tok", "my-refresh-tok");

    expect(getStoredRefreshToken()).toBe("my-refresh-tok");
  });

  // TC-4.14
  it("returns null in server-side environments (document undefined)", () => {
    vi.stubGlobal("document", undefined);

    expect(getStoredRefreshToken()).toBeNull();

    vi.unstubAllGlobals();
  });
});
