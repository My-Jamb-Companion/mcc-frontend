import { apiClient } from "./api-client";

const getItem = (key: string): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(key) : null;

const hasCookieSession = (): boolean =>
  typeof document !== "undefined" && document.cookie.includes("mcc_auth=1");

apiClient.interceptors.request.use(
  (config) => {
    const token = getItem("mcc_access_token");
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
  localStorage.removeItem("mcc_access_token");
  localStorage.removeItem("mcc_refresh_token");
  localStorage.removeItem("mcc_user");
  document.cookie = "mcc_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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

      const refreshToken = getItem("mcc_refresh_token");

      try {
        // Use localStorage refresh token if present, otherwise rely on the
        // httpOnly refresh-token cookie (set after Google OAuth) being sent
        // automatically via withCredentials.
        const body = refreshToken ? { refresh_token: refreshToken } : {};
        const res = await apiClient.post("/auth/token/refresh", body);
        const { access_token, refresh_token: newRefresh } = res.data.data;

        localStorage.setItem("mcc_access_token", access_token);
        if (newRefresh) localStorage.setItem("mcc_refresh_token", newRefresh);

        drainQueue(access_token);
        isRefreshing = false;
        original.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(original);
      } catch {
        isRefreshing = false;
        drainQueue("");

        // Only wipe the session if there is no active cookie-based session.
        // A cookie session (from Google OAuth) may still be valid even when
        // localStorage tokens are absent.
        if (!hasCookieSession()) {
          clearAuthAndRedirect();
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
