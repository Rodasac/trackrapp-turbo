import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/run-job.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  noExternal: [/.*/],
  banner: {
    // Banner is prepended to ALL output files (entries + chunks), so every bundled CJS
    // package (e.g. web-push → require('crypto'), pino → __dirname) gets the shims it needs.
    // `shims: true` only injects __dirname/__filename and uses esbuild's `inject` which
    // tree-shakes per-file — it doesn't reach shared chunks. Banner bypasses that.
    js: [
      'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
      'import { fileURLToPath as __fileURLToPath } from "url"; import { dirname as __dirnameHelper } from "path";',
      'const __filename = __fileURLToPath(import.meta.url); const __dirname = __dirnameHelper(__filename);',
    ].join("\n"),
  },
  sourcemap: true,
  splitting: true,
});
