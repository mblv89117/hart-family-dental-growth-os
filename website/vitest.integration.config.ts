import path from "path";
import { config } from "dotenv";
import { defineConfig } from "vitest/config";

config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["tests/setup-integration.ts"],
    fileParallelism: false,
    testTimeout: 60000,
  },
});
