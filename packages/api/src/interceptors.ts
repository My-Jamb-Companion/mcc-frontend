import { apiClient } from "./api-client";
import { tokenManager } from "./token-manager";

const hasCookieSession = (): boolean =>
  typeof document !== "undefined" && document.cookie.includes("mcc_auth=1");

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

      try {
        // Rely on the httpOnly refresh-token cookie sent automatically via withCredentials.
        const res = await apiClient.post("/auth/token/refresh", {});
        const { access_token } = res.data.data;

        tokenManager.set(access_token);
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
