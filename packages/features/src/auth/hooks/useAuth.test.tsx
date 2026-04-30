import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useAuthStore } from "@mcc/store";
import { useAuth } from "./useAuth";
import * as authService from "../services/auth.service";
import * as sessionService from "../services/session";
import type { User } from "@mcc/types";

// ─── mock the service layer ───────────────────────────────────────────────────
vi.mock("../services/auth.service", () => ({
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
}));

vi.mock("../services/session", () => ({
  saveSession: vi.fn(),
  clearSession: vi.fn(),
  getStoredUser: vi.fn(),
  getStoredAccessToken: vi.fn(),
}));

// ─── typed mock references ────────────────────────────────────────────────────
const mockLoginApi = vi.mocked(authService.loginApi);
const mockLogoutApi = vi.mocked(authService.logoutApi);
const mockGetStoredUser = vi.mocked(sessionService.getStoredUser);
const mockGetStoredAccessToken = vi.mocked(sessionService.getStoredAccessToken);
const mockSaveSession = vi.mocked(sessionService.saveSession);
const mockClearSession = vi.mocked(sessionService.clearSession);

// ─── mock user ────────────────────────────────────────────────────────────────
const mockUser: User = {
  user_id: "user-1",
  email: "user@example.com",
  role: "student",
};

const mockLoginResponse = {
  access_token: "access-tok",
  refresh_token: "refresh-tok",
  token_type: "Bearer",
  expires_in: 3600,
  user: mockUser,
};

// ─── QueryClient wrapper ──────────────────────────────────────────────────────
// Every hook that uses React Query must be wrapped in a QueryClientProvider
// retry: false means failed mutations don't retry — tests stay fast and predictable
function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── reset everything before each test ───────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ user: null, accessToken: null });
  localStorage.clear();
  // default: nothing in storage
  mockGetStoredUser.mockReturnValue(null);
  mockGetStoredAccessToken.mockReturnValue(null);
});

// ─────────────────────────────────────────────────────────────────────────────
// hydration
// ─────────────────────────────────────────────────────────────────────────────
describe("hydration", () => {
  // TC-6.1
  it("hydrated becomes true after mount", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // The important guarantee: after mount, hydrated is always true
    await waitFor(() => expect(result.current.hydrated).toBe(true));
  });

  // TC-6.2
  it("restores user from localStorage when store is empty on mount", async () => {
    mockGetStoredUser.mockReturnValue(mockUser);
    mockGetStoredAccessToken.mockReturnValue("stored-tok");

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user?.user_id).toBe("user-1");
    });
  });

  // TC-6.3
  it("does not overwrite existing store user with localStorage data", async () => {
    // store already has a user
    useAuthStore.setState({ user: mockUser, accessToken: "existing-tok" });
    // localStorage also has a different user
    mockGetStoredUser.mockReturnValue({
      ...mockUser,
      user_id: "different-user",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    // original store user should be untouched
    expect(result.current.user?.user_id).toBe("user-1");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// loginMutation
// ─────────────────────────────────────────────────────────────────────────────
describe("loginMutation", () => {
  // TC-6.4
  it("isPending is true while login is in progress", async () => {
    let resolveFn!: (value: typeof mockLoginResponse) => void;

    mockLoginApi.mockReturnValue(
      new Promise<typeof mockLoginResponse>((resolve) => {
        resolveFn = resolve;
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // start the mutation — don't await it
    act(() => {
      result.current.loginMutation.mutate({
        email: "a@b.com",
        password: "pw",
      });
    });

    // check isPending before resolving
    await waitFor(() =>
      expect(result.current.loginMutation.isPending).toBe(true),
    );

    // now resolve so the test cleans up properly
    act(() => resolveFn(mockLoginResponse));
  });

  // TC-6.5
  it("saves session to localStorage on successful login", async () => {
    mockLoginApi.mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.loginMutation.mutate({
        email: "user@example.com",
        password: "password123",
      });
    });

    await waitFor(() =>
      expect(result.current.loginMutation.isSuccess).toBe(true),
    );

    expect(mockSaveSession).toHaveBeenCalledWith(
      mockUser,
      "access-tok",
      "refresh-tok",
    );
  });

  // TC-6.6
  it("updates the auth store on successful login", async () => {
    mockLoginApi.mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.loginMutation.mutate({
        email: "user@example.com",
        password: "password123",
      });
    });

    await waitFor(() => expect(result.current.user?.user_id).toBe("user-1"));

    expect(useAuthStore.getState().accessToken).toBe("access-tok");
  });

  // TC-6.7
  it("isError is true when login fails", async () => {
    mockLoginApi.mockRejectedValue(new Error("Invalid credentials"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.loginMutation.mutate({
        email: "a@b.com",
        password: "wrong",
      });
    });

    await waitFor(() =>
      expect(result.current.loginMutation.isError).toBe(true),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// logoutMutation
// ─────────────────────────────────────────────────────────────────────────────
describe("logoutMutation", () => {
  // TC-6.8
  it("calls logoutApi on the server", async () => {
    mockLogoutApi.mockResolvedValue(undefined);
    useAuthStore.setState({ user: mockUser, accessToken: "tok" });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logoutMutation.mutate();
    });

    await waitFor(() =>
      expect(result.current.logoutMutation.isSuccess).toBe(true),
    );

    expect(mockLogoutApi).toHaveBeenCalledOnce();
  });

  // TC-6.9
  it("clears localStorage and store even when server logout fails", async () => {
    mockLogoutApi.mockRejectedValue(new Error("Server error"));
    useAuthStore.setState({ user: mockUser, accessToken: "tok" });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logoutMutation.mutate();
    });

    await waitFor(() =>
      expect(
        result.current.logoutMutation.isSuccess ||
          result.current.logoutMutation.isError,
      ).toBe(true),
    );

    expect(mockClearSession).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isAuthenticated
// ─────────────────────────────────────────────────────────────────────────────
describe("isAuthenticated", () => {
  // TC-6.10
  it("is false when no user is in the store", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
  });

  // TC-6.11
  it("is true after successful login", async () => {
    mockLoginApi.mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.loginMutation.mutate({
        email: "user@example.com",
        password: "password123",
      });
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
  });
});
