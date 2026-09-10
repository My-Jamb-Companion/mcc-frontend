import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Scopes this app's auth cookies/localStorage keys apart from the other
  // apps in the monorepo — see packages/api/src/session-keys.ts.
  env: { NEXT_PUBLIC_APP_ID: "admin" },
  turbopack: {},
};

export default nextConfig;
