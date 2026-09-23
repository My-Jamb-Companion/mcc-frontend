import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  env: {
    // Scopes this app's auth cookies/localStorage keys apart from the other
    // apps in the monorepo — see packages/api/src/session-keys.ts.
    NEXT_PUBLIC_APP_ID: "landing",
    // Where enrolled users are handed off to — see src/config.ts. Override
    // per environment (e.g. the deployed Student Platform's real URL).
    NEXT_PUBLIC_LEARNER_URL:
      process.env.NEXT_PUBLIC_LEARNER_URL || "http://localhost:3000",
    // packages/api/src/api-client.ts falls back to "" (relative — wrong,
    // there's no backend on this app's own origin) if unset. A real
    // deployment sets this explicitly (Vercel env vars, same as the other
    // apps); this default only ever fires in local dev.
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
