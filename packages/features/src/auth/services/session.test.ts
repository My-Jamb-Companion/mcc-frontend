import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveSession,
  clearSession,
  getStoredUser,
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
});

// ─────────────────────────────────────────────────────────────────────────────
// saveSession
// ─────────────────────────────────────────────────────────────────────────────
describe("saveSession", () => {
  // TC-4.1
  it("sets the access token in tokenManager (memory)", () => {
    saveSession(mockUser, "access-tok");

    expect(tokenManager.get()).toBe("access-tok");
  });

  // TC-4.2
  it("does NOT write tokens to localStorage", () => {
    saveSession(mockUser, "access-tok");

    expect(localStorage.getItem("mcc_access_token")).toBeNull();
    expect(localStorage.getItem("mcc_refresh_token")).toBeNull();
  });

  // TC-4.3
  it("writes the user as a JSON string to localStorage", () => {
    saveSession(mockUser, "access-tok");

    const stored = JSON.parse(localStorage.getItem("mcc_user")!);
    expect(stored.user_id).toBe(mockUser.user_id);
    expect(stored.email).toBe(mockUser.email);
  });

  // TC-4.4
  it("sets the mcc_auth cookie", () => {
    saveSession(mockUser, "access-tok");

    expect(document.cookie).toContain("mcc_auth=1");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// clearSession
// ─────────────────────────────────────────────────────────────────────────────
describe("clearSession", () => {
  // TC-4.5
  it("removes user from localStorage and clears tokenManager", () => {
    saveSession(mockUser, "access-tok");

    clearSession();

    expect(localStorage.getItem("mcc_user")).toBeNull();
    expect(tokenManager.get()).toBeNull();
  });

  // TC-4.6
  it("expires the mcc_auth cookie", () => {
    saveSession(mockUser, "access-tok");

    clearSession();

    expect(document.cookie).not.toContain("mcc_auth=1");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getStoredUser
// ─────────────────────────────────────────────────────────────────────────────
describe("getStoredUser", () => {
  // TC-4.7
  it("returns null when no user is stored", () => {
    expect(getStoredUser()).toBeNull();
  });

  // TC-4.8
  it("returns the parsed user object when one is stored", () => {
    localStorage.setItem("mcc_user", JSON.stringify(mockUser));

    const result = getStoredUser();

    expect(result?.user_id).toBe(mockUser.user_id);
    expect(result?.email).toBe(mockUser.email);
  });

  // TC-4.9
  it("returns null in server-side environments (window undefined)", () => {
    vi.stubGlobal("window", undefined);

    expect(getStoredUser()).toBeNull();

    vi.unstubAllGlobals();
  });
});
