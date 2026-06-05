import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const resolveSrc = (pkg: string): string =>
  fileURLToPath(new URL(`./packages/${pkg}/src/index.ts`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@composable-model-graph/core": resolveSrc("core"),
    },
  },
  test: {
    include: ["packages/*/tests/**/*.test.ts"],
    environment: "node",
  },
});
