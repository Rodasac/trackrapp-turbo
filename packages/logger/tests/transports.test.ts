import { describe, it, expect } from "vitest";
import {
  buildConsoleTransport,
  buildFileTransport,
  buildTransportTargets,
} from "../src/transports.js";
import type { LoggerConfig } from "../src/types.js";

const baseConfig: LoggerConfig = {
  name: "test",
  level: "info",
  logDir: "logs",
  fileEnabled: false,
  pretty: false,
  extraTransports: [],
};

describe("buildConsoleTransport", () => {
  it("returns pino-pretty target when pretty=true", () => {
    const target = buildConsoleTransport({ ...baseConfig, pretty: true });
    expect(target.target).toBe("pino-pretty");
  });

  it("returns pino/file target when pretty=false", () => {
    const target = buildConsoleTransport({ ...baseConfig, pretty: false });
    expect(target.target).toBe("pino/file");
  });

  it("pino/file target has destination 1 (stdout)", () => {
    const target = buildConsoleTransport({ ...baseConfig, pretty: false });
    expect(target.options?.destination).toBe(1);
  });

  it("uses the configured log level", () => {
    const target = buildConsoleTransport({ ...baseConfig, level: "debug" });
    expect(target.level).toBe("debug");
  });

  it("pino-pretty options include colorize: true", () => {
    const target = buildConsoleTransport({ ...baseConfig, pretty: true });
    expect(target.options?.colorize).toBe(true);
  });
});

describe("buildFileTransport", () => {
  it("returns a target with pino-roll", () => {
    const target = buildFileTransport({
      ...baseConfig,
      fileEnabled: true,
      logDir: "/tmp/logs",
    });
    expect(target.target).toBe("pino-roll");
  });

  it("includes the log directory in the file path", () => {
    const target = buildFileTransport({
      ...baseConfig,
      fileEnabled: true,
      logDir: "/var/log/app",
    });
    expect(target.options?.file).toContain("/var/log/app");
  });

  it("uses daily frequency", () => {
    const target = buildFileTransport({ ...baseConfig, fileEnabled: true });
    expect(target.options?.frequency).toBe("daily");
  });

  it("sets 14-day retention limit", () => {
    const target = buildFileTransport({ ...baseConfig, fileEnabled: true });
    expect(target.options?.limit?.count).toBe(14);
  });

  it("uses the configured log level", () => {
    const target = buildFileTransport({
      ...baseConfig,
      level: "warn",
      fileEnabled: true,
    });
    expect(target.level).toBe("warn");
  });
});

describe("buildTransportTargets", () => {
  it("always includes the console transport", () => {
    const targets = buildTransportTargets(baseConfig);
    expect(targets.length).toBeGreaterThanOrEqual(1);
    const targetNames = targets.map((t) => t.target);
    expect(targetNames).toContain("pino/file");
  });

  it("does not include file transport when fileEnabled=false", () => {
    const targets = buildTransportTargets({
      ...baseConfig,
      fileEnabled: false,
    });
    const targetNames = targets.map((t) => t.target);
    expect(targetNames).not.toContain("pino-roll");
  });

  it("includes file transport when fileEnabled=true", () => {
    const targets = buildTransportTargets({ ...baseConfig, fileEnabled: true });
    const targetNames = targets.map((t) => t.target);
    expect(targetNames).toContain("pino-roll");
  });

  it("appends extraTransports at the end", () => {
    const extraTransport = {
      target: "pino-opentelemetry-transport",
      level: "info" as const,
      options: {},
    };
    const targets = buildTransportTargets({
      ...baseConfig,
      extraTransports: [extraTransport],
    });
    expect(targets[targets.length - 1]).toEqual(extraTransport);
  });

  it("returns exactly 1 target with no file and no extras", () => {
    const targets = buildTransportTargets({
      ...baseConfig,
      fileEnabled: false,
      extraTransports: [],
    });
    expect(targets).toHaveLength(1);
  });

  it("returns 2 targets when fileEnabled=true and no extras", () => {
    const targets = buildTransportTargets({
      ...baseConfig,
      fileEnabled: true,
      extraTransports: [],
    });
    expect(targets).toHaveLength(2);
  });
});
