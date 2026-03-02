import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/run-job.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  noExternal: [/@repo\/.*/], // Bundle workspace packages into output
  sourcemap: true,
  splitting: true,
});
