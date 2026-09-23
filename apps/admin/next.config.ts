import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Scopes this app's auth cookies/localStorage keys apart from the other
  // apps in the monorepo — see packages/api/src/session-keys.ts.
  env: {
    NEXT_PUBLIC_APP_ID: "admin",
    // Missing here (unlike parent/teacher/landing) meant apiClient's
    // baseURL defaulted to "", so every request silently hit this app's
    // own origin instead of the backend -- a real pre-existing gap, not
    // something Phase 8.1 introduced.
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  },
  turbopack: {},
};

export default nextConfig;
