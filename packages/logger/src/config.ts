import type { LoggerConfig } from "./types.js";

function isEnabled(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

/**
 * Build a LoggerConfig by merging env vars with optional caller overrides.
 * Overrides take highest precedence; env vars are the fallback; code defaults are the base.
 */
export function resolveConfig(overrides?: Partial<LoggerConfig>): LoggerConfig {
  const isDev = process.env.NODE_ENV === "development";

  const fromEnv: LoggerConfig = {
    name: "",
    level: (process.env.LOG_LEVEL as LoggerConfig["level"]) ?? "info",
    logDir: process.env.LOG_DIR ?? "logs",
    fileEnabled: isEnabled(process.env.LOG_FILE_ENABLED),
    pretty:
      process.env.LOG_PRETTY !== undefined
        ? isEnabled(process.env.LOG_PRETTY)
        : isDev,
    extraTransports: [],
  };

  return { ...fromEnv, ...overrides };
}
