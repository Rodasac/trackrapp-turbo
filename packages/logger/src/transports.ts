import type { TransportTargetOptions } from "pino";
import type { LoggerConfig } from "./types.js";
import path from "node:path";

export function buildConsoleTransport(
  config: LoggerConfig,
): TransportTargetOptions {
  if (config.pretty) {
    return {
      target: "pino-pretty",
      level: config.level,
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    };
  }

  return {
    target: "pino/file",
    level: config.level,
    options: { destination: 1 },
  };
}

export function buildFileTransport(
  config: LoggerConfig,
): TransportTargetOptions {
  return {
    target: "pino-roll",
    level: config.level,
    options: {
      file: path.join(config.logDir, "app.log"),
      frequency: "daily",
      mkdir: true,
      limit: { count: 14 },
    },
  };
}

export function buildTransportTargets(
  config: LoggerConfig,
): TransportTargetOptions[] {
  const targets: TransportTargetOptions[] = [buildConsoleTransport(config)];

  if (config.fileEnabled) {
    targets.push(buildFileTransport(config));
  }

  targets.push(...config.extraTransports);

  return targets;
}
