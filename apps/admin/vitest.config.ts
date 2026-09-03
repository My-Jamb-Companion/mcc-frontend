import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    globals: true,
    environment: "edge-runtime",
    setupFiles: [path.resolve(__dirname, "../../vitest.setup.ts")],
    exclude: ["dist/**", "node_modules/**", ".next/**"],
  },
});
