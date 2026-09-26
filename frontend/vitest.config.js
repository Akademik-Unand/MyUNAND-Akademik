import { defineConfig } from "vitest/config";

// Match the automatic JSX runtime used by the application when rendering components in tests.
export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: { environment: "node" },
});
