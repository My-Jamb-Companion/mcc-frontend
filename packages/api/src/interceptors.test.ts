import { AxiosHeaders } from "axios";
import { apiClient } from "./api-client";
import "./interceptors"; // registers the interceptors as a side effect
import { tokenManager } from "./token-manager";
import { AUTH_COOKIE, REFRESH_COOKIE } from "./session-keys";
import { refreshSession } from "./session-refresh";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── mock the axios adapter so no real network calls happen ──────────────────
const mockAdapter = vi.fn();
apiClient.defaults.adapter = mockAdapter;

// ─── helper: build a proper AxiosResponse ────────────────────────────────────
function makeResponse(status: number, data: unknown) {
  return {
    status,
    data,
    headers: new AxiosHeaders(),
    config: {
      headers: new AxiosHeaders(),
      url: "/test",
    },
    statusText: "OK",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  // clearAllMocks keeps implementations; without a reset, one test's
  // mockImplementation silently answers the next test's requests.
  mockAdapter.mockReset();
  tokenManager.clear();
  localStorage.clear();
  document.cookie = `${REFRESH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────────────────────────────────────
describe("request interceptor", () => {
  // TC-2.1
  it("attaches Bearer token when one exists in tokenManager", async () => {
    tokenManager.set("my-token-abc");

    mockAdapter.mockResolvedValueOnce(makeResponse(200, { success: true }));

    await apiClient.get("/test");

    const calledConfig = mockAdapter.mock.calls[0][0];
    expect(calledConfig.headers.Authorization).toBe("Bearer my-token-abc");
  });

  // TC-2.2
  it("does NOT add Authorization header when no token exists", async () => {
    tokenManager.clear();

    mockAdapter.mockResolvedValueOnce(makeResponse(200, { success: true }));

    await apiClient.get("/test");

    const calledConfig = mockAdapter.mock.calls[0][0];
    expect(calledConfig.headers.Authorization).toBeUndefined();
  });

  // TC-2.3
  it("skips token safely when window is undefined (SSR)", async () => {
    vi.stubGlobal("window", undefined);

    mockAdapter.mockResolvedValueOnce(makeResponse(200, { success: true }));

    await apiClient.get("/test");

    const calledConfig = mockAdapter.mock.calls[0][0];
    expect(calledConfig.headers.Authorization).toBeUndefined();

    vi.unstubAllGlobals();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — success path
// ─────────────────────────────────────────────────────────────────────────────
describe("response interceptor — success", () => {
  // TC-2.4
  it("passes successful responses through unchanged", async () => {
    const fakeData = { success: true, data: [] };
    mockAdapter.mockResolvedValueOnce(makeResponse(200, fakeData));

    const result = await apiClient.get("/test");

    expect(result.data).toEqual(fakeData);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — 401 / refresh logic
// ─────────────────────────────────────────────────────────────────────────────
describe("response interceptor — 401 handling", () => {
  // TC-2.5
  it("calls the refresh endpoint when a 401 occurs", async () => {
    mockAdapter
      // first call → 401 on /courses
      .mockRejectedValueOnce({
        response: { status: 401, data: {} },
        config: { url: "/courses", headers: new AxiosHeaders(), _retry: false },
        isAxiosError: true,
      })
      // second call → successful refresh
      .mockResolvedValueOnce(
        makeResponse(200, {
          data: { access_token: "new-access", refresh_token: "new-refresh" },
        }),
      )
      // third call → retry of original request succeeds
      .mockResolvedValueOnce(makeResponse(200, { data: [] }));

    document.cookie = `${REFRESH_COOKIE}=old-refresh-token; path=/`;

    await apiClient.get("/courses").catch(() => {});

    const calls = mockAdapter.mock.calls.map((c) => c[0].url);
    expect(calls).toContain("/auth/token/refresh");
  });

  // TC-2.6
  it("only calls refresh ONCE even when multiple 401s arrive simultaneously", async () => {
    document.cookie = `${REFRESH_COOKIE}=old-refresh-token; path=/`;
    let refreshCount = 0;

    mockAdapter.mockImplementation(
      (config: { url: string; headers: AxiosHeaders; _retry?: boolean }) => {
        if (config.url === "/auth/token/refresh") {
          refreshCount++;
          return new Promise((resolve) =>
            setTimeout(
              () =>
                resolve(
                  makeResponse(200, {
                    data: {
                      access_token: "new-tok",
                      refresh_token: "new-r",
                    },
                  }),
                ),
              10,
            ),
          );
        }

        if (config.headers?.Authorization?.includes("new-tok")) {
          return Promise.resolve(makeResponse(200, { data: [] }));
        }

        return Promise.reject({
          response: { status: 401, data: {} },
          config,
          isAxiosError: true,
        });
      },
    );

    await Promise.allSettled([
      apiClient.get("/url-1"),
      apiClient.get("/url-2"),
      apiClient.get("/url-3"),
    ]);

    expect(refreshCount).toBe(1);
  });

  // TC-2.7
  it("stores the new access token in tokenManager after refresh", async () => {
    document.cookie = `${REFRESH_COOKIE}=old-refresh-token; path=/`;
    mockAdapter.mockImplementation(
      (config: { url: string; headers: AxiosHeaders; _retry?: boolean }) => {
        if (config.url === "/auth/token/refresh") {
          return Promise.resolve(
            makeResponse(200, {
              data: {
                access_token: "brand-new-token",
                refresh_token: "new-r",
              },
            }),
          );
        }
        if (!config._retry) {
          return Promise.reject({
            response: { status: 401, data: {} },
            config: { ...config, _retry: false },
            isAxiosError: true,
          });
        }
        return Promise.resolve(makeResponse(200, { data: [] }));
      },
    );

    await apiClient.get("/courses").catch(() => {});

    expect(tokenManager.get()).toBe("brand-new-token");
  });

  // TC-2.8
  it("clears tokenManager and redirects to /login when refresh fails", async () => {
    tokenManager.set("expired-tok");

    const hrefSetter = vi.fn();
    Object.defineProperty(window, "location", {
      value: {
        set href(v: string) {
          hrefSetter(v);
        },
      },
      configurable: true,
      writable: true,
    });

    // Reject with the config axios actually sent (it carries the expired token
    // the request interceptor attached), not a hand-built one without it.
    mockAdapter
      .mockImplementationOnce((config) =>
        Promise.reject({ response: { status: 401, data: {} }, config, isAxiosError: true }),
      )
      // No refresh token anywhere (no stored copy, no server cookie): the
      // server answers 400, which means the session can't be restored.
      .mockImplementationOnce((config) =>
        Promise.reject({ response: { status: 400, data: {} }, config, isAxiosError: true }),
      );

    await apiClient.get("/courses").catch(() => {});

    expect(tokenManager.get()).toBeNull();
    expect(hrefSetter).toHaveBeenCalledWith("/login");
  });

  // TC-2.9
  it("does NOT retry when the refresh endpoint itself returns 401", async () => {
    mockAdapter.mockRejectedValueOnce({
      response: { status: 401, data: {} },
      config: {
        url: "/auth/token/refresh",
        headers: new AxiosHeaders(),
        _retry: false,
      },
      isAxiosError: true,
    });

    await apiClient.get("/auth/token/refresh").catch(() => {});

    expect(mockAdapter).toHaveBeenCalledTimes(1);
  });

  // TC-2.10
  it("clears session and redirects when the refresh call itself fails", async () => {
    const hrefSetter = vi.fn();
    Object.defineProperty(window, "location", {
      value: {
        set href(v: string) {
          hrefSetter(v);
        },
      },
      configurable: true,
      writable: true,
    });

    mockAdapter
      .mockRejectedValueOnce({
        response: { status: 401, data: {} },
        config: { url: "/courses", headers: new AxiosHeaders(), _retry: false },
        isAxiosError: true,
      })
      .mockRejectedValueOnce(new Error("Server down"));

    await apiClient.get("/courses").catch(() => {});

    expect(hrefSetter).toHaveBeenCalledWith("/login");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Refresh race (observed 16 Sep 2026: concurrent refreshes ending a session)
// ─────────────────────────────────────────────────────────────────────────────
describe("refresh race", () => {
  const AUTH_MARKER = `${AUTH_COOKIE}=1; path=/`;
  const unauthorized = (config: unknown) =>
    Promise.reject({ response: { status: 401, data: {} }, config, isAxiosError: true });

  let hrefSetter: ReturnType<typeof vi.fn<(href: string) => void>>;
  beforeEach(() => {
    document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    hrefSetter = vi.fn<(href: string) => void>();
    Object.defineProperty(window, "location", {
      value: { set href(v: string) { hrefSetter(v); } },
      configurable: true,
      writable: true,
    });
  });

  it("refreshSession shares one request between concurrent callers", async () => {
    document.cookie = `${REFRESH_COOKIE}=r1; path=/`;
    mockAdapter.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 10));
      return makeResponse(200, { data: { access_token: "a2", refresh_token: "r2" } });
    });

    const tokens = await Promise.all([refreshSession(), refreshSession(), refreshSession()]);

    expect(tokens).toEqual(["a2", "a2", "a2"]);
    expect(mockAdapter).toHaveBeenCalledTimes(1);
  });

  it("refreshSession keeps the rotated refresh token for the next refresh", async () => {
    document.cookie = `${REFRESH_COOKIE}=r1; path=/`;
    mockAdapter.mockResolvedValueOnce(makeResponse(200, { data: { access_token: "a2", refresh_token: "r2" } }));

    await refreshSession();

    expect(document.cookie).toContain(`${REFRESH_COOKIE}=r2`);
  });

  it("refreshSession falls back to the server's own cookie when there is no stored token", async () => {
    mockAdapter.mockResolvedValueOnce(makeResponse(200, { data: { access_token: "a2" } }));

    await refreshSession();

    // No body token: the browser's httpOnly refresh_token cookie is the credential.
    expect(JSON.parse(mockAdapter.mock.calls[0][0].data)).toEqual({});
  });

  it("logs out when the server refuses the refresh token, even with a session marker cookie", async () => {
    // Previously the marker cookie suppressed the redirect, leaving the user on
    // pages that could only keep failing.
    document.cookie = AUTH_MARKER;
    document.cookie = `${REFRESH_COOKIE}=spent; path=/`;
    tokenManager.set("expired");
    mockAdapter.mockImplementation((config: { url: string }) => unauthorized(config));

    await apiClient.get("/courses").catch(() => {});

    expect(hrefSetter).toHaveBeenCalledWith("/login");
  });

  it("keeps the session when refresh fails for a transient reason", async () => {
    document.cookie = AUTH_MARKER;
    document.cookie = `${REFRESH_COOKIE}=r1; path=/`;
    tokenManager.set("expired");
    mockAdapter.mockImplementation((config: { url: string }) =>
      config.url === "/auth/token/refresh"
        ? Promise.reject(Object.assign(new Error("Network Error"), { isAxiosError: true }))
        : unauthorized(config),
    );

    await apiClient.get("/courses").catch(() => {});

    expect(hrefSetter).not.toHaveBeenCalled();
    expect(document.cookie).toContain(`${AUTH_COOKIE}=1`);
  });

  it("does not retry waiting requests with an empty token after a failed refresh", async () => {
    document.cookie = AUTH_MARKER;
    document.cookie = `${REFRESH_COOKIE}=spent; path=/`;
    tokenManager.set("expired");
    let refreshes = 0;
    mockAdapter.mockImplementation(async (config: { url: string; headers: AxiosHeaders }) => {
      if (config.url === "/auth/token/refresh") {
        refreshes++;
        await new Promise((r) => setTimeout(r, 10));
        return unauthorized(config);
      }
      return unauthorized(config);
    });

    await Promise.allSettled([apiClient.get("/a"), apiClient.get("/b"), apiClient.get("/c")]);

    // One refresh for all three, and no cascade of refreshes from retries.
    expect(refreshes).toBe(1);
    const sentWithEmptyBearer = mockAdapter.mock.calls.filter(
      ([config]) => String(config.headers?.Authorization ?? "") === "Bearer ",
    );
    expect(sentWithEmptyBearer).toHaveLength(0);
  });

  it("retries with the current token, without refreshing, when a 401 was sent with an older one", async () => {
    tokenManager.set("old");
    let refreshes = 0;
    mockAdapter.mockImplementation((config: { url: string; headers: AxiosHeaders }) => {
      if (config.url === "/auth/token/refresh") {
        refreshes++;
        return Promise.resolve(makeResponse(200, { data: { access_token: "new" } }));
      }
      if (String(config.headers.Authorization) === "Bearer old") {
        // A refresh completes while this request is on its way back.
        tokenManager.set("new");
        return unauthorized(config);
      }
      return Promise.resolve(makeResponse(200, { data: ["ok"] }));
    });

    const res = await apiClient.get("/courses");

    expect(res.data).toEqual({ data: ["ok"] });
    expect(refreshes).toBe(0);
  });
});
