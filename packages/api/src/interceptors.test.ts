import axios, { AxiosHeaders } from "axios";
import { apiClient } from "./api-client";
import "./interceptors"; // registers the interceptors as a side effect
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

// ─── helper: build a fake 401 error ──────────────────────────────────────────
// function make401(url: string) {
//   const error = {
//     response: { status: 401, data: {} },
//     config: {
//       url,
//       headers: new AxiosHeaders(),
//       _retry: false,
//     },
//     isAxiosError: true,
//   };
//   return error;
// }

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────────────────────────────────────
describe("request interceptor", () => {
  // TC-2.1
  it("attaches Bearer token when one exists in localStorage", async () => {
    localStorage.setItem("mcc_access_token", "my-token-abc");

    mockAdapter.mockResolvedValueOnce(makeResponse(200, { success: true }));

    await apiClient.get("/test");

    // the adapter receives the final config — check the Authorization header
    const calledConfig = mockAdapter.mock.calls[0][0];
    expect(calledConfig.headers.Authorization).toBe("Bearer my-token-abc");
  });

  // TC-2.2
  it("does NOT add Authorization header when no token exists", async () => {
    localStorage.clear();

    mockAdapter.mockResolvedValueOnce(makeResponse(200, { success: true }));

    await apiClient.get("/test");

    const calledConfig = mockAdapter.mock.calls[0][0];
    expect(calledConfig.headers.Authorization).toBeUndefined();
  });

  // TC-2.3
  it("skips localStorage safely when window is undefined (SSR)", async () => {
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
  it("calls the refresh endpoint when a 401 occurs and refresh token exists", async () => {
    localStorage.setItem("mcc_refresh_token", "refresh-tok");

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

    await apiClient.get("/courses").catch(() => {});

    // find the refresh call
    const calls = mockAdapter.mock.calls.map((c) => c[0].url);
    expect(calls).toContain("/auth/token/refresh");
  });

  // TC-2.6
  it("only calls refresh ONCE even when multiple 401s arrive simultaneously", async () => {
    localStorage.setItem("mcc_refresh_token", "refresh-tok");

    let refreshCount = 0;
    // Track which configs have been marked as retries
    // const retryConfigs = new Set<string>();

    mockAdapter.mockImplementation(
      (config: { url: string; headers: AxiosHeaders; _retry?: boolean }) => {
        // This is the refresh call
        if (config.url === "/auth/token/refresh") {
          refreshCount++;
          // Simulate async refresh taking some time
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

        // This is a retry (interceptor sets Authorization header with new token)
        if (config.headers?.Authorization?.includes("new-tok")) {
          return Promise.resolve(makeResponse(200, { data: [] }));
        }

        // This is the original request — reject with 401
        // Return the SAME config object so _retry mutation is visible
        return Promise.reject({
          response: { status: 401, data: {} },
          config, // ← pass the same reference, not a copy
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
  it("retries queued requests with the NEW token after refresh", async () => {
    localStorage.setItem("mcc_refresh_token", "old-refresh");

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

    expect(localStorage.getItem("mcc_access_token")).toBe("brand-new-token");
  });

  // TC-2.8
  it("clears session and redirects to /login when no refresh token exists", async () => {
    localStorage.clear();
    localStorage.setItem("mcc_access_token", "expired-tok");

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

    mockAdapter.mockRejectedValueOnce({
      response: { status: 401, data: {} },
      config: { url: "/courses", headers: new AxiosHeaders(), _retry: false },
      isAxiosError: true,
    });

    await apiClient.get("/courses").catch(() => {});

    expect(localStorage.getItem("mcc_access_token")).toBeNull();
    expect(hrefSetter).toHaveBeenCalledWith("/login");
  });

  // TC-2.9
  it("does NOT retry when the refresh endpoint itself returns 401", async () => {
    localStorage.setItem("mcc_refresh_token", "refresh-tok");

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

    // only one adapter call — no retry
    expect(mockAdapter).toHaveBeenCalledTimes(1);
  });

  // TC-2.10
  it("clears session and redirects when the refresh call itself fails", async () => {
    localStorage.setItem("mcc_refresh_token", "refresh-tok");

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
