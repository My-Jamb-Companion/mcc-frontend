import { apiClient } from "./api-client";
import { tokenManager } from "./token-manager";
import { AUTH_COOKIE, REFRESH_COOKIE, USER_KEY } from "./session-keys";
import { isSessionExpired, refreshSession } from "./session-refresh";

const hasCookieSession = (): boolean =>
  typeof document !== "undefined" && document.cookie.includes(`${AUTH_COOKIE}=1`);

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

const clearAuthAndRedirect = () => {
  if (typeof window === "undefined") return;
  tokenManager.clear();
  localStorage.removeItem(USER_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${REFRESH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  window.location.href = "/login";
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error.config as typeof error.config & { _retry?: boolean };

    const isRefreshEndpoint = original?.url?.includes("/auth/token/refresh");

    if (status !== 401 || !original || original._retry || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    // Marked before waiting, so a request that still fails after the refresh
    // is rejected rather than triggering yet another refresh. Requests that
    // used to wait in a queue were never marked, and a failed refresh retried
    // them with an empty token -- each 401 then started its own refresh.
    original._retry = true;

    // Sent with an older token than the one we now hold: a refresh finished
    // while this request was on its way. Retry with the current token rather
    // than rotating the refresh token again.
    const sentWith = String(original.headers?.Authorization ?? "").replace(/^Bearer\s+/, "");
    const current = tokenManager.get();
    if (current && sentWith !== current) {
      original.headers.Authorization = `Bearer ${current}`;
      return apiClient(original);
    }

    try {
      // Shared: however many requests 401 together, and whether or not a
      // page-load session restore is already refreshing, this is one refresh.
      const accessToken = await refreshSession();
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      // The server refused the refresh token: the session is over, so say so
      // rather than leaving the user on pages that can only fail. A transient
      // failure (network, server error) keeps the session and lets the request
      // fail, unless there's no session marker left to keep.
      if (isSessionExpired(refreshError) || !hasCookieSession()) {
        clearAuthAndRedirect();
      }
      return Promise.reject(error);
    }
  },
);
