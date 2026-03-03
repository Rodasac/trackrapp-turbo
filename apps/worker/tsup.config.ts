import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/run-job.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  noExternal: [/.*/], // Bundle all npm deps for a fully standalone build (no node_modules in runner)
  sourcemap: true,
  splitting: true,
});
