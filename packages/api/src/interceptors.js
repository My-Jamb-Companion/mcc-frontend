import { apiClient } from "./api-client";
/**
 * Request Interceptor
 */
apiClient.interceptors.request.use((config) => {
    // later: attach token
    const user = typeof window !== "undefined"
        ? localStorage.getItem("user")
        : null;
    if (user) {
        const parsed = JSON.parse(user);
        config.headers.Authorization = `Bearer ${parsed.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
/**
 * Response Interceptor
 */
apiClient.interceptors.response.use((response) => response, (error) => {
    const status = error?.response?.status;
    if (status === 401) {
        //  Auto logout
        if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            // simple redirect
            window.location.href = "/login";
        }
    }
    return Promise.reject(error);
});
