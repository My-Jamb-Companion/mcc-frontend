import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth-store";
import type { User } from "@mcc/types";

// ─── mock user matching the real User interface ───────────────────────────────
const mockUser: User = {
  user_id: "user-1",
  email: "user@example.com",
  role: "student",
};

// ─── reset store to initial state before every test ──────────────────────────
// This is the Zustand way — setState directly resets without re-creating the store
beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null });
});

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────
describe("initial state", () => {
  // TC-5.1
  it("has user as null and accessToken as null", () => {
    const { user, accessToken } = useAuthStore.getState();

    expect(user).toBeNull();
    expect(accessToken).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setUser
// ─────────────────────────────────────────────────────────────────────────────
describe("setUser", () => {
  // TC-5.2
  it("updates the user in the store", () => {
    useAuthStore.getState().setUser(mockUser);

    expect(useAuthStore.getState().user?.user_id).toBe("user-1");
    expect(useAuthStore.getState().user?.email).toBe("user@example.com");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setAccessToken
// ─────────────────────────────────────────────────────────────────────────────
describe("setAccessToken", () => {
  // TC-5.3
  it("stores the token and makes it readable", () => {
    useAuthStore.getState().setAccessToken("my-token-xyz");

    expect(useAuthStore.getState().accessToken).toBe("my-token-xyz");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// logout
// ─────────────────────────────────────────────────────────────────────────────
describe("logout", () => {
  // TC-5.4
  it("resets both user and accessToken to null", () => {
    // first put something in the store
    useAuthStore.setState({ user: mockUser, accessToken: "tok" });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Singleton behaviour
// ─────────────────────────────────────────────────────────────────────────────
describe("store singleton", () => {
  // TC-5.5
  it("returns the same state across multiple getState() calls", () => {
    useAuthStore.getState().setUser(mockUser);

    const stateA = useAuthStore.getState();
    const stateB = useAuthStore.getState();

    expect(stateA.user).toBe(stateB.user);
  });
});
