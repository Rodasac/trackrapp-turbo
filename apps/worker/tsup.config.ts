import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/run-job.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  noExternal: [/@repo\/.*/], // Bundle workspace packages; npm deps stay external (avoid CJS/ESM issues)
  sourcemap: true,
  splitting: true,
});
