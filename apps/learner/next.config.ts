import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Scopes this app's auth cookies/localStorage keys apart from the other
  // apps in the monorepo — see packages/api/src/session-keys.ts.
  env: { NEXT_PUBLIC_APP_ID: "learner" },
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
