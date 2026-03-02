import { createLogger, createChildLogger } from "@repo/logger";

/** Root logger for the worker process */
export const workerLog = createLogger({ name: "worker" });

/** Per-job child loggers */
export const remindersLog = createChildLogger(workerLog, {
  context: "send-reminders",
});
export const cleanupLog = createChildLogger(workerLog, { context: "cleanup" });
export const aiTipsLog = createChildLogger(workerLog, {
  context: "generate-ai-tips",
});
export const autoRenewLog = createChildLogger(workerLog, {
  context: "auto-renew",
});
export const runJobLog = createChildLogger(workerLog, { context: "run-job" });
export const aiServiceLog = createChildLogger(workerLog, {
  context: "ai-service",
});
