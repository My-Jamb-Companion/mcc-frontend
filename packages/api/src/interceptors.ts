import { apiClient } from "./api-client";
import { tokenManager } from "./token-manager";
import { AUTH_COOKIE, REFRESH_COOKIE, USER_KEY } from "./session-keys";

const hasCookieSession = (): boolean =>
  typeof document !== "undefined" && document.cookie.includes(`${AUTH_COOKIE}=1`);

const getRefreshTokenCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const setRefreshTokenCookie = (token: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${REFRESH_COOKIE}=${encodeURIComponent(token)}; path=/; SameSite=Strict; max-age=${30 * 24 * 60 * 60}`;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

const drainQueue = (token: string) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

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

    if (status === 401 && !original._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshTokenCookie();

      if (!refreshToken) {
        isRefreshing = false;
        drainQueue("");
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const res = await apiClient.post("/auth/token/refresh", {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token: newRefresh } = res.data.data;

        tokenManager.set(access_token);
        if (newRefresh) setRefreshTokenCookie(newRefresh);
        drainQueue(access_token);
        isRefreshing = false;
        original.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(original);
      } catch {
        isRefreshing = false;
        drainQueue("");

        if (!hasCookieSession()) {
          clearAuthAndRedirect();
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
