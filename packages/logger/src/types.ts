import type { Logger as PinoLogger, TransportTargetOptions } from "pino";

/** Re-exported pino Logger type for consumers */
export type Logger = PinoLogger;

export interface LoggerConfig {
  /** Logger name (shown in logs as "name" field) */
  name: string;
  /** Log level (default: "info") */
  level: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  /** Directory for rotated log files (default: "logs") */
  logDir: string;
  /** Enable daily-rotated file transport (default: false) */
  fileEnabled: boolean;
  /** Force pretty printing on/off (default: auto-detect from NODE_ENV) */
  pretty: boolean;
  /** Additional transports to append (for OTel, etc.) */
  extraTransports: TransportTargetOptions[];
}

export interface ChildLoggerOptions {
  /** Context label bound to all log records from this child */
  context: string;
  /** Additional bindings merged into every log record */
  bindings?: Record<string, unknown>;
}
