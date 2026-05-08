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
  refreshTokenApi: vi.fn(),
}));

vi.mock("../services/session", () => ({
  saveSession: vi.fn(),
  clearSession: vi.fn(),
  getStoredUser: vi.fn(),
  getStoredRefreshToken: vi.fn(),
}));

// ─── typed mock references ────────────────────────────────────────────────────
const mockLoginApi = vi.mocked(authService.loginApi);
const mockLogoutApi = vi.mocked(authService.logoutApi);
const mockRefreshTokenApi = vi.mocked(authService.refreshTokenApi);
const mockGetStoredUser = vi.mocked(sessionService.getStoredUser);
const mockGetStoredRefreshToken = vi.mocked(sessionService.getStoredRefreshToken);
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
  document.cookie = "mcc_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  // default: nothing stored
  mockGetStoredUser.mockReturnValue(null);
  mockGetStoredRefreshToken.mockReturnValue(null);
  mockRefreshTokenApi.mockResolvedValue({
    access_token: "refreshed-tok",
    refresh_token: "new-refresh-tok",
    token_type: "Bearer",
    expires_in: 3600,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// hydration
// ─────────────────────────────────────────────────────────────────────────────
describe("hydration", () => {
  // TC-6.1
  it("hydrated becomes true after mount", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));
  });

  // TC-6.2
  it("restores user and calls silent refresh when cookie, stored user, and refresh token exist", async () => {
    document.cookie = "mcc_auth=1; path=/";
    mockGetStoredUser.mockReturnValue(mockUser);
    mockGetStoredRefreshToken.mockReturnValue("stored-refresh-tok");

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.user?.user_id).toBe("user-1"));

    expect(mockRefreshTokenApi).toHaveBeenCalledWith("stored-refresh-tok");
  });

  // TC-6.3
  it("does not call silent refresh when user already in store", async () => {
    useAuthStore.setState({ user: mockUser, accessToken: "existing-tok" });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(mockRefreshTokenApi).not.toHaveBeenCalled();
    expect(result.current.user?.user_id).toBe("user-1");
  });

  // TC-6.4
  it("does not call silent refresh when refresh token cookie is missing", async () => {
    document.cookie = "mcc_auth=1; path=/";
    mockGetStoredUser.mockReturnValue(mockUser);
    mockGetStoredRefreshToken.mockReturnValue(null); // no refresh token

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    expect(mockRefreshTokenApi).not.toHaveBeenCalled();
  });

  // TC-6.5
  it("swallows silent refresh failure and keeps user in store", async () => {
    document.cookie = "mcc_auth=1; path=/";
    mockGetStoredUser.mockReturnValue(mockUser);
    mockGetStoredRefreshToken.mockReturnValue("stored-refresh-tok");
    mockRefreshTokenApi.mockRejectedValue(new Error("Refresh failed"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));

    // user is restored from storage; session is NOT cleared
    expect(result.current.user?.user_id).toBe("user-1");
    expect(mockClearSession).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// loginMutation
// ─────────────────────────────────────────────────────────────────────────────
describe("loginMutation", () => {
  // TC-6.6
  it("isPending is true while login is in progress", async () => {
    let resolveFn!: (value: typeof mockLoginResponse) => void;

    mockLoginApi.mockReturnValue(
      new Promise<typeof mockLoginResponse>((resolve) => {
        resolveFn = resolve;
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.loginMutation.mutate({ email: "a@b.com", password: "pw" });
    });

    await waitFor(() =>
      expect(result.current.loginMutation.isPending).toBe(true),
    );

    act(() => resolveFn(mockLoginResponse));
  });

  // TC-6.7
  it("saves session with user, access token, and refresh token on successful login", async () => {
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

    expect(mockSaveSession).toHaveBeenCalledWith(mockUser, "access-tok", "refresh-tok");
  });

  // TC-6.8
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

  // TC-6.9
  it("isError is true when login fails", async () => {
    mockLoginApi.mockRejectedValue(new Error("Invalid credentials"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.loginMutation.mutate({ email: "a@b.com", password: "wrong" });
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
  // TC-6.10
  it("calls logoutApi on the server", async () => {
    mockLogoutApi.mockResolvedValue(undefined);
    useAuthStore.setState({ user: mockUser, accessToken: "tok" });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => { result.current.logoutMutation.mutate(); });

    await waitFor(() =>
      expect(result.current.logoutMutation.isSuccess).toBe(true),
    );

    expect(mockLogoutApi).toHaveBeenCalledOnce();
  });

  // TC-6.11
  it("clears session and store even when server logout fails", async () => {
    mockLogoutApi.mockRejectedValue(new Error("Server error"));
    useAuthStore.setState({ user: mockUser, accessToken: "tok" });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => { result.current.logoutMutation.mutate(); });

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
  // TC-6.12
  it("is false when no user is in the store", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
  });

  // TC-6.13
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
