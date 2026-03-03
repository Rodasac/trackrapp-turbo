import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/run-job.ts"],
  format: ["esm"],
  target: "node24",
  outDir: "dist",
  clean: true,
  // Bundle workspace packages (they export raw .ts, not available in node_modules at runtime)
  noExternal: [/@repo\/.*/],
  // All npm dependencies are external — resolved from node_modules by node at runtime
  external: [
    "@ai-sdk/anthropic",
    "@ai-sdk/groq",
    "@ai-sdk/openai",
    "ai",
    "argon2",
    "dotenv",
    "drizzle-orm",
    "lucide-react",
    "node-cron",
    "nodemailer",
    "pino",
    "pino-pretty",
    "pino-roll",
    "postgres",
    "web-push",
    "zod",
  ],
  sourcemap: true,
  splitting: true,
});
