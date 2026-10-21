import { AxiosHeaders } from "axios";
import { apiClient } from "./api-client";
import "./interceptors";
import { tokenManager } from "./token-manager";
import { AUTH_COOKIE, REFRESH_COOKIE, USER_KEY } from "./session-keys";
import { isSessionExpired, refreshSession, whenSessionReady } from "./session-refresh";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAdapter = vi.fn();
apiClient.defaults.adapter = mockAdapter;

const response = (status: number, data: unknown) => ({
  status,
  data,
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders(), url: "/auth/token/refresh" },
  statusText: "OK",
});

const clearCookies = () => {
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${REFRESH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

beforeEach(() => {
  mockAdapter.mockReset();
  tokenManager.clear();
  clearCookies();
});

describe("whenSessionReady", () => {
  it("does nothing for a visitor", async () => {
    await whenSessionReady();
    expect(mockAdapter).not.toHaveBeenCalled();
  });

  it("does nothing when the tab already has a token", async () => {
    document.cookie = `${AUTH_COOKIE}=1; path=/`;
    tokenManager.set("access");
    await whenSessionReady();
    expect(mockAdapter).not.toHaveBeenCalled();
  });

  it("waits for the refresh on a signed-in page load, sharing one with other callers", async () => {
    document.cookie = `${AUTH_COOKIE}=1; path=/`;
    document.cookie = `${REFRESH_COOKIE}=stored-refresh; path=/`;
    mockAdapter.mockResolvedValue(response(200, { data: { access_token: "fresh", refresh_token: "rotated" } }));

    await Promise.all([whenSessionReady(), whenSessionReady()]);

    expect(tokenManager.get()).toBe("fresh");
    expect(mockAdapter).toHaveBeenCalledTimes(1);
  });

  it("resolves even when the refresh fails, so the request still goes out", async () => {
    document.cookie = `${AUTH_COOKIE}=1; path=/`;
    mockAdapter.mockRejectedValue(new Error("offline"));
    await expect(whenSessionReady()).resolves.toBeUndefined();
    expect(tokenManager.get()).toBeNull();
  });
});


describe("refreshSession with two accounts in one browser", () => {
  const refreshed = (userId: string) => response(200, {data: {access_token: "new-access", refresh_token: "new-refresh", user: {user_id: userId}}});

  beforeEach(() => {
    localStorage.setItem(USER_KEY, JSON.stringify({user_id: "learner1"}));
    document.cookie = `${REFRESH_COOKIE}=${encodeURIComponent("learner-refresh")}; path=/`;
  });

  it("sends this app's own refresh token", async () => {
    mockAdapter.mockResolvedValueOnce(refreshed("learner1"));
    await refreshSession();
    expect(JSON.parse(mockAdapter.mock.calls[0][0].data)).toEqual({refresh_token: "learner-refresh"});
  });

  it("takes the new access token when the server answers for the same user", async () => {
    mockAdapter.mockResolvedValueOnce(refreshed("learner1"));
    await expect(refreshSession()).resolves.toBe("new-access");
    expect(tokenManager.get()).toBe("new-access");
  });

  it("ends the session rather than become a different account", async () => {
    mockAdapter.mockResolvedValueOnce(refreshed("admin1"));
    const error = await refreshSession().catch((e) => e);
    expect(isSessionExpired(error)).toBe(true);
    expect(tokenManager.get()).toBeNull();
  });
});
