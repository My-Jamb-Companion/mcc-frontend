import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mcc/tooling": path.resolve(__dirname, "../../tooling"),
    };

    return config;
  },
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
