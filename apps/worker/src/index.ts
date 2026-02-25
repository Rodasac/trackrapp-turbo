import cron from "node-cron";
import { validateEnv } from "./env.js";
import { initVapid } from "./services/push.js";
import { runSendReminders } from "./jobs/send-reminders.js";
import { runCleanup } from "./jobs/cleanup.js";
import { generateAiTips } from "./jobs/generate-ai-tips.js";

const env = validateEnv();

initVapid({
  subject: env.VAPID_SUBJECT,
  publicKey: env.VAPID_PUBLIC_KEY,
  privateKey: env.VAPID_PRIVATE_KEY,
});

console.log("[worker] Starting TrackrApp notification worker...");
console.log("[worker] Schedule:");
console.log("[worker]   send-reminders   → every hour  (0 * * * *)");
console.log("[worker]   cleanup          → daily 3am   (0 3 * * *)");
console.log("[worker]   generate-ai-tips → Sunday 2am  (0 2 * * 0)");

// Every hour: send renewal reminders
cron.schedule("0 * * * *", async () => {
  console.log("[send-reminders] Running...");
  try {
    await runSendReminders();
  } catch (err) {
    console.error("[send-reminders] Error:", err);
  }
});

// Daily 3am: delete old read notifications
cron.schedule("0 3 * * *", async () => {
  console.log("[cleanup] Running...");
  try {
    await runCleanup();
  } catch (err) {
    console.error("[cleanup] Error:", err);
  }
});

// Sunday 2am: generate AI tips (stub)
cron.schedule("0 2 * * 0", async () => {
  console.log("[generate-ai-tips] Running...");
  try {
    await generateAiTips();
  } catch (err) {
    console.error("[generate-ai-tips] Error:", err);
  }
});

console.log("[worker] All cron jobs scheduled. Waiting...");

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`[worker] Received ${signal}, shutting down gracefully...`);
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
