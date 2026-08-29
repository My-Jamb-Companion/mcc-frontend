import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 10000,
  withCredentials: true,
});

/**
 * Bare axios instance — no baseURL, no auth interceptor, no credentials.
 *
 * Use this for requests to a foreign host the app doesn't own (e.g. PUTting
 * a file straight to a presigned object-storage URL). Sending `apiClient`'s
 * Bearer token or cookies to a third-party host would leak credentials
 * cross-origin, and most presigned URLs aren't configured to accept
 * credentialed CORS requests anyway.
 */
export const externalClient = axios.create();