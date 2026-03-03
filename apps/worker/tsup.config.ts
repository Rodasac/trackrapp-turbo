import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/run-job.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  noExternal: [/.*/], // Bundle all deps for a fully standalone build
  shims: true, // Inject createRequire shim so bundled CJS packages (e.g. web-push) can call require('crypto')
  sourcemap: true,
  splitting: true,
});
