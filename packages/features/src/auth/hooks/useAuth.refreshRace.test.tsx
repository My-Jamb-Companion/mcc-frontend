/**
 * Session restore on page load must not race itself or the interceptor.
 *
 * Observed 16 Sep 2026 in the admin console: every full page load sent FOUR
 * POST /auth/token/refresh requests in the same second. useAuth() is mounted
 * twice (AuthProvider and the (admin) layout) and React Strict Mode runs mount
 * effects twice in development: 2 x 2 = 4. Each call rotated the same refresh
 * token independently, so the server could reject some of them, and the
 * rotated refresh token each one received was thrown away.
 *
 * Unlike useAuth.test.tsx, nothing here mocks the auth service: only the
 * network adapter is stubbed, so the real useAuth -> service -> apiClient ->
 * interceptor path runs.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";
import { AxiosHeaders } from "axios";
import { StrictMode, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@mcc/store";
import { apiClient, tokenManager, AUTH_COOKIE, REFRESH_COOKIE, USER_KEY } from "@mcc/api";
import { useAuth } from "./useAuth";

const adapter = vi.fn();
apiClient.defaults.adapter = adapter;

const ok = (data: unknown, url = "/") => ({
  status: 200,
  data,
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders(), url },
  statusText: "OK",
});

const readCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

function Consumer() {
  useAuth();
  return null;
}

// The admin app's shape: a provider and a layout, both calling useAuth().
function App({ children }: { children?: ReactNode }) {
  const qc = new QueryClient();
  return (
    <StrictMode>
      <QueryClientProvider client={qc}>
        <Consumer />
        <Consumer />
        {children}
      </QueryClientProvider>
    </StrictMode>
  );
}

beforeEach(() => {
  adapter.mockReset();
  tokenManager.clear();
  useAuthStore.setState({ user: null, accessToken: null });
  localStorage.clear();
  // A logged-in session as a fresh page load finds it: no access token in
  // memory, the session marker and refresh token cookies, and the stored user.
  document.cookie = `${AUTH_COOKIE}=1; path=/`;
  document.cookie = `${REFRESH_COOKIE}=refresh-v1; path=/`;
  localStorage.setItem(USER_KEY, JSON.stringify({ user_id: "u1", email: "a@b.c", role: "admin" }));
});

const refreshCalls = () =>
  adapter.mock.calls.filter(([config]) => config.url === "/auth/token/refresh");

describe("session restore on page load", () => {
  it("sends one refresh however many components restore the session", async () => {
    adapter.mockImplementation(async (config) =>
      config.url === "/auth/token/refresh"
        ? ok({ data: { access_token: "access-v2", refresh_token: "refresh-v2" } }, config.url)
        : ok({ data: [] }, config.url),
    );

    render(<App />);

    await waitFor(() => expect(tokenManager.get()).toBe("access-v2"));
    // Give any stragglers a chance to fire before counting.
    await act(() => new Promise((r) => setTimeout(r, 20)));
    expect(refreshCalls()).toHaveLength(1);
  });

  it("keeps the rotated refresh token, so the next refresh doesn't present a spent one", async () => {
    adapter.mockImplementation(async (config) =>
      config.url === "/auth/token/refresh"
        ? ok({ data: { access_token: "access-v2", refresh_token: "refresh-v2" } }, config.url)
        : ok({ data: [] }, config.url),
    );

    render(<App />);

    await waitFor(() => expect(tokenManager.get()).toBe("access-v2"));
    expect(readCookie(REFRESH_COOKIE)).toBe("refresh-v2");
  });

  it("shares one refresh with a request that 401s while the session is restoring", async () => {
    let releaseRefresh!: () => void;
    const refreshGate = new Promise<void>((r) => (releaseRefresh = r));

    adapter.mockImplementation(async (config) => {
      if (config.url === "/auth/token/refresh") {
        await refreshGate;
        return ok({ data: { access_token: "access-v2", refresh_token: "refresh-v2" } }, config.url);
      }
      // A data request made before any access token exists.
      if (!String(config.headers?.Authorization ?? "").includes("access-v2")) {
        return Promise.reject({ response: { status: 401, data: {} }, config, isAxiosError: true });
      }
      return ok({ data: ["teacher"] }, config.url);
    });

    render(<App />);
    const pageRequest = apiClient.get("/admin/teachers");

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
      releaseRefresh();
    });

    await expect(pageRequest).resolves.toMatchObject({ data: { data: ["teacher"] } });
    expect(refreshCalls()).toHaveLength(1);
  });
});
