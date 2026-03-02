import { createLogger, createChildLogger } from "@repo/logger";

/** Root logger for the Next.js web app (server-side only) */
export const webLog = createLogger({ name: "web" });

/** Child logger for API routes */
export const apiLog = createChildLogger(webLog, { context: "api" });
