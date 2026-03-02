import pino from "pino";
import { resolveConfig } from "./config.js";
import { buildTransportTargets } from "./transports.js";
import type { Logger, LoggerConfig, ChildLoggerOptions } from "./types.js";

/**
 * Create a root logger. Call once per app (e.g., at startup).
 *
 * @param overrides - Partial LoggerConfig; merged over env-derived defaults.
 */
export function createLogger(overrides?: Partial<LoggerConfig>): Logger {
  const config = resolveConfig(overrides);
  const targets = buildTransportTargets(config);

  const transport = pino.transport({ targets });

  return pino(
    {
      name: config.name || undefined,
      level: config.level,
    },
    transport,
  );
}

/**
 * Create a child logger bound to a specific context.
 * Prefer this over using the root logger directly in jobs/modules.
 *
 * @param parent - The root logger (or another child)
 * @param options - context label + optional extra bindings
 */
export function createChildLogger(
  parent: Logger,
  options: ChildLoggerOptions,
): Logger {
  const { context, bindings = {} } = options;
  return parent.child({ context, ...bindings });
}
