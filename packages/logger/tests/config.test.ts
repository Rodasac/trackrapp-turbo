import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { LoggerConfig } from "../src/types.js";

// We will import resolveConfig after setting up env vars
let resolveConfig: (overrides?: Partial<LoggerConfig>) => LoggerConfig;

async function importFresh() {
  // Vitest module cache is per test file, but env vars are process-level.
  // We re-import so the module reads env at call time (not at module load).
  const mod = await import("../src/config.js");
  return mod.resolveConfig;
}

describe("resolveConfig", () => {
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(async () => {
    // Save and clear relevant env vars
    for (const key of [
      "LOG_LEVEL",
      "LOG_DIR",
      "LOG_FILE_ENABLED",
      "LOG_PRETTY",
      "NODE_ENV",
    ]) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
    resolveConfig = await importFresh();
  });

  afterEach(() => {
    // Restore env
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  describe("defaults", () => {
    it('defaults level to "info"', () => {
      const config = resolveConfig();
      expect(config.level).toBe("info");
    });

    it('defaults logDir to "logs"', () => {
      const config = resolveConfig();
      expect(config.logDir).toBe("logs");
    });

    it("defaults fileEnabled to false", () => {
      const config = resolveConfig();
      expect(config.fileEnabled).toBe(false);
    });

    it("defaults name to empty string", () => {
      const config = resolveConfig();
      expect(config.name).toBe("");
    });

    it("defaults extraTransports to empty array", () => {
      const config = resolveConfig();
      expect(config.extraTransports).toEqual([]);
    });
  });

  describe("LOG_LEVEL env var", () => {
    it("reads LOG_LEVEL from env", async () => {
      process.env.LOG_LEVEL = "debug";
      resolveConfig = await importFresh();
      const config = resolveConfig();
      expect(config.level).toBe("debug");
    });

    it("accepts all valid levels", async () => {
      for (const level of [
        "trace",
        "debug",
        "info",
        "warn",
        "error",
        "fatal",
      ] as const) {
        process.env.LOG_LEVEL = level;
        resolveConfig = await importFresh();
        const config = resolveConfig();
        expect(config.level).toBe(level);
      }
    });
  });

  describe("LOG_DIR env var", () => {
    it("reads LOG_DIR from env", async () => {
      process.env.LOG_DIR = "/var/log/myapp";
      resolveConfig = await importFresh();
      const config = resolveConfig();
      expect(config.logDir).toBe("/var/log/myapp");
    });
  });

  describe("LOG_FILE_ENABLED env var", () => {
    it('enables file transport when LOG_FILE_ENABLED="true"', async () => {
      process.env.LOG_FILE_ENABLED = "true";
      resolveConfig = await importFresh();
      const config = resolveConfig();
      expect(config.fileEnabled).toBe(true);
    });

    it('enables file transport when LOG_FILE_ENABLED="1"', async () => {
      process.env.LOG_FILE_ENABLED = "1";
      resolveConfig = await importFresh();
      const config = resolveConfig();
      expect(config.fileEnabled).toBe(true);
    });

    it('keeps fileEnabled false for LOG_FILE_ENABLED="false"', async () => {
      process.env.LOG_FILE_ENABLED = "false";
      resolveConfig = await importFresh();
      const config = resolveConfig();
      expect(config.fileEnabled).toBe(false);
    });
  });

  describe("LOG_PRETTY / NODE_ENV auto-detection", () => {
    it('defaults pretty to true in NODE_ENV="development"', async () => {
      process.env.NODE_ENV = "development";
      resolveConfig = await importFresh();
      const config = resolveConfig();
      expect(config.pretty).toBe(true);
    });

    it('defaults pretty to false in NODE_ENV="production"', async () => {
      process.env.NODE_ENV = "production";
      resolveConfig = await importFresh();
      const config = resolveConfig();
      expect(config.pretty).toBe(false);
    });

    it("defaults pretty to false when NODE_ENV is unset", async () => {
      // NODE_ENV already deleted in beforeEach
      resolveConfig = await importFresh();
      const config = resolveConfig();
      expect(config.pretty).toBe(false);
    });

    it('LOG_PRETTY="true" forces pretty on regardless of NODE_ENV', async () => {
      process.env.NODE_ENV = "production";
      process.env.LOG_PRETTY = "true";
      resolveConfig = await importFresh();
      const config = resolveConfig();
      expect(config.pretty).toBe(true);
    });

    it('LOG_PRETTY="false" forces pretty off in development', async () => {
      process.env.NODE_ENV = "development";
      process.env.LOG_PRETTY = "false";
      resolveConfig = await importFresh();
      const config = resolveConfig();
      expect(config.pretty).toBe(false);
    });
  });

  describe("overrides precedence", () => {
    it("override takes precedence over env vars", async () => {
      process.env.LOG_LEVEL = "error";
      resolveConfig = await importFresh();
      const config = resolveConfig({ level: "debug" });
      expect(config.level).toBe("debug");
    });

    it("override merges with env-derived config", async () => {
      process.env.LOG_DIR = "/tmp/logs";
      resolveConfig = await importFresh();
      const config = resolveConfig({ name: "my-app" });
      expect(config.name).toBe("my-app");
      expect(config.logDir).toBe("/tmp/logs");
    });

    it("extraTransports override is preserved", () => {
      const transport = {
        target: "pino-opentelemetry-transport",
        level: "info" as const,
        options: {},
      };
      const config = resolveConfig({ extraTransports: [transport] });
      expect(config.extraTransports).toEqual([transport]);
    });
  });
});
