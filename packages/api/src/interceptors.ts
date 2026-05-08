import { apiClient } from "./api-client";
import { tokenManager } from "./token-manager";

const hasCookieSession = (): boolean =>
  typeof document !== "undefined" && document.cookie.includes("mcc_auth=1");

const getRefreshTokenCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)mcc_refresh_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const setRefreshTokenCookie = (token: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `mcc_refresh_token=${encodeURIComponent(token)}; path=/; SameSite=Strict; max-age=${30 * 24 * 60 * 60}`;
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
  localStorage.removeItem("mcc_user");
  document.cookie = "mcc_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "mcc_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
