import { AxiosHeaders } from "axios";
import { apiClient } from "./api-client";
import "./interceptors";
import { tokenManager } from "./token-manager";
import { AUTH_COOKIE, REFRESH_COOKIE } from "./session-keys";
import { whenSessionReady } from "./session-refresh";
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
