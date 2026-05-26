import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts", "app/**/*.test.ts"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["**/node_modules/**", "**/.next/**", "tests/**", "**/*.config.*"],
    },
    setupFiles: ["tests/setup.ts"],
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
      "@": path.resolve(__dirname, "./"),
    },
  },
});
