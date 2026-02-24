import { uiConfig } from "@repo/vitest-config/ui";
import { mergeConfig } from "vitest/config";
import path from "path";

export default mergeConfig(uiConfig, {
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    setupFiles: ["./tests/setup.ts"],
  },
});
