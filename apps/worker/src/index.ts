import "dotenv/config";
import cron from "node-cron";
import { validateEnv } from "./env.js";
import { initVapid } from "./services/push.js";
import { runSendReminders } from "./jobs/send-reminders.js";
import { runCleanup } from "./jobs/cleanup.js";
import { generateAiTips } from "./jobs/generate-ai-tips.js";
import { runAutoRenew } from "./jobs/auto-renew.js";
import {
  workerLog,
  remindersLog,
  cleanupLog,
  aiTipsLog,
  autoRenewLog,
} from "./logger.js";

const env = validateEnv();

initVapid({
  subject: env.VAPID_SUBJECT,
  publicKey: env.VAPID_PUBLIC_KEY,
  privateKey: env.VAPID_PRIVATE_KEY,
});

workerLog.info("Starting TrackrApp notification worker...");
workerLog.info("Schedule:");
workerLog.info("  send-reminders   → every hour  (0 * * * *)");
workerLog.info("  cleanup          → daily 3am   (0 3 * * *)");
workerLog.info("  generate-ai-tips → Sunday 2am  (0 2 * * 0)");
workerLog.info("  auto-renew       → daily midnight (0 0 * * *)");

// Every hour: send renewal reminders
cron.schedule("0 * * * *", async () => {
  remindersLog.info("Running...");
  try {
    await runSendReminders();
  } catch (err) {
    remindersLog.error({ err }, "Error");
  }
});

// Daily 3am: delete old read notifications
cron.schedule("0 3 * * *", async () => {
  cleanupLog.info("Running...");
  try {
    await runCleanup();
  } catch (err) {
    cleanupLog.error({ err }, "Error");
  }
});

// Sunday 2am: generate AI tips (stub)
cron.schedule("0 2 * * 0", async () => {
  aiTipsLog.info("Running...");
  try {
    await generateAiTips();
  } catch (err) {
    aiTipsLog.error({ err }, "Error");
  }
});

// Daily midnight: auto-renew due subscriptions
cron.schedule("0 0 * * *", async () => {
  autoRenewLog.info("Running...");
  try {
    await runAutoRenew();
  } catch (err) {
    autoRenewLog.error({ err }, "Error");
  }
});

workerLog.info("All cron jobs scheduled. Waiting...");

// Graceful shutdown
function shutdown(signal: string) {
  workerLog.info({ signal }, "Received signal, shutting down gracefully...");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
