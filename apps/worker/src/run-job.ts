/**
 * Manual job runner — execute any worker job on-demand via CLI.
 *
 * Usage:
 *   pnpm --filter=worker run-job send-reminders
 *   pnpm --filter=worker run-job cleanup
 *   pnpm --filter=worker run-job generate-ai-tips
 */

import { validateEnv } from "./env.js";
import { initVapid } from "./services/push.js";
import { runSendReminders } from "./jobs/send-reminders.js";
import { runCleanup } from "./jobs/cleanup.js";
import { generateAiTips } from "./jobs/generate-ai-tips.js";
import { runAutoRenew } from "./jobs/auto-renew.js";
import { runJobLog } from "./logger.js";

export const VALID_JOBS = [
  "send-reminders",
  "cleanup",
  "generate-ai-tips",
  "auto-renew",
] as const;

export type JobName = (typeof VALID_JOBS)[number];

/** Validates the job name argument from process.argv. Calls process.exit(1) on error. */
export function parseJobName(args: string[]): JobName {
  const name = args[2];

  if (!name) {
    runJobLog.error({ validJobs: VALID_JOBS }, "No job name provided");
    process.exit(1);
  }

  if (!VALID_JOBS.includes(name as JobName)) {
    runJobLog.error({ jobName: name, validJobs: VALID_JOBS }, "Unknown job");
    process.exit(1);
  }

  return name as JobName;
}

/** Runs the named job, initialising env (and VAPID for send-reminders). */
export async function runJob(name: JobName): Promise<void> {
  const env = validateEnv();

  if (name === "send-reminders") {
    initVapid({
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY,
      subject: env.VAPID_SUBJECT,
    });
    await runSendReminders();
    return;
  }

  if (name === "cleanup") {
    await runCleanup();
    return;
  }

  if (name === "generate-ai-tips") {
    await generateAiTips();
    return;
  }

  if (name === "auto-renew") {
    await runAutoRenew();
    return;
  }
}

// ─── Auto-execute when invoked directly as a CLI ──────────────────────────────

if (process.argv[1]?.includes("run-job")) {
  const jobName = parseJobName(process.argv);
  runJobLog.info({ jobName }, "Running job");
  runJob(jobName)
    .then(() => {
      runJobLog.info({ jobName }, "Job completed successfully");
      process.exit(0);
    })
    .catch((err: unknown) => {
      runJobLog.error({ err, jobName }, "Job failed");
      process.exit(1);
    });
}
