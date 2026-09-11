import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Scopes this app's auth cookies/localStorage keys apart from the other
  // apps in the monorepo — see packages/api/src/session-keys.ts.
  env: {
    NEXT_PUBLIC_APP_ID: "learner",
    // Missing here (unlike parent/teacher/landing) meant apiClient's
    // baseURL defaulted to "", so every request silently hit this app's
    // own origin instead of the backend -- same gap fixed in apps/admin
    // during Phase 8.1, flagged there as needed again for Phase 8.2.
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mcc/tooling": path.resolve(__dirname, "../../tooling"),
    };

    return config;
  },
  turbopack: {},
};

export default nextConfig;
