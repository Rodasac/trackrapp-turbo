import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  mockValidateEnv,
  mockInitVapid,
  mockRunSendReminders,
  mockRunCleanup,
  mockGenerateAiTips,
} = vi.hoisted(() => ({
  mockValidateEnv: vi.fn().mockReturnValue({
    VAPID_PUBLIC_KEY: "pub",
    VAPID_PRIVATE_KEY: "priv",
    VAPID_SUBJECT: "mailto:test@example.com",
  }),
  mockInitVapid: vi.fn(),
  mockRunSendReminders: vi.fn().mockResolvedValue(undefined),
  mockRunCleanup: vi.fn().mockResolvedValue(undefined),
  mockGenerateAiTips: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/env.js", () => ({
  validateEnv: mockValidateEnv,
}));

vi.mock("../src/services/push.js", () => ({
  initVapid: mockInitVapid,
}));

vi.mock("../src/jobs/send-reminders.js", () => ({
  runSendReminders: mockRunSendReminders,
}));

vi.mock("../src/jobs/cleanup.js", () => ({
  runCleanup: mockRunCleanup,
}));

vi.mock("../src/jobs/generate-ai-tips.js", () => ({
  generateAiTips: mockGenerateAiTips,
}));

import { VALID_JOBS, parseJobName, runJob } from "../src/run-job.js";

// ─── VALID_JOBS ───────────────────────────────────────────────────────────────

describe("VALID_JOBS", () => {
  it("contains send-reminders, cleanup, and generate-ai-tips", () => {
    expect(VALID_JOBS).toContain("send-reminders");
    expect(VALID_JOBS).toContain("cleanup");
    expect(VALID_JOBS).toContain("generate-ai-tips");
  });

  it("contains exactly 3 jobs", () => {
    expect(VALID_JOBS).toHaveLength(3);
  });
});

// ─── parseJobName ─────────────────────────────────────────────────────────────

describe("parseJobName", () => {
  const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit called");
  });

  beforeEach(() => {
    exitSpy.mockClear();
  });

  it("accepts send-reminders", () => {
    const result = parseJobName(["node", "run-job.ts", "send-reminders"]);
    expect(result).toBe("send-reminders");
  });

  it("accepts cleanup", () => {
    const result = parseJobName(["node", "run-job.ts", "cleanup"]);
    expect(result).toBe("cleanup");
  });

  it("accepts generate-ai-tips", () => {
    const result = parseJobName(["node", "run-job.ts", "generate-ai-tips"]);
    expect(result).toBe("generate-ai-tips");
  });

  it("calls process.exit(1) when no job name provided", () => {
    expect(() => parseJobName(["node", "run-job.ts"])).toThrow(
      "process.exit called",
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("calls process.exit(1) for an unknown job name", () => {
    expect(() => parseJobName(["node", "run-job.ts", "unknown-job"])).toThrow(
      "process.exit called",
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

// ─── runJob ───────────────────────────────────────────────────────────────────

describe("runJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateEnv.mockReturnValue({
      VAPID_PUBLIC_KEY: "pub",
      VAPID_PRIVATE_KEY: "priv",
      VAPID_SUBJECT: "mailto:test@example.com",
    });
  });

  describe("send-reminders", () => {
    it("calls validateEnv and initVapid before running the job", async () => {
      await runJob("send-reminders");
      expect(mockValidateEnv).toHaveBeenCalledOnce();
      expect(mockInitVapid).toHaveBeenCalledOnce();
    });

    it("passes VAPID keys from env to initVapid", async () => {
      await runJob("send-reminders");
      expect(mockInitVapid).toHaveBeenCalledWith({
        publicKey: "pub",
        privateKey: "priv",
        subject: "mailto:test@example.com",
      });
    });

    it("calls runSendReminders", async () => {
      await runJob("send-reminders");
      expect(mockRunSendReminders).toHaveBeenCalledOnce();
    });
  });

  describe("cleanup", () => {
    it("calls validateEnv", async () => {
      await runJob("cleanup");
      expect(mockValidateEnv).toHaveBeenCalledOnce();
    });

    it("does not call initVapid", async () => {
      await runJob("cleanup");
      expect(mockInitVapid).not.toHaveBeenCalled();
    });

    it("calls runCleanup", async () => {
      await runJob("cleanup");
      expect(mockRunCleanup).toHaveBeenCalledOnce();
    });
  });

  describe("generate-ai-tips", () => {
    it("calls validateEnv", async () => {
      await runJob("generate-ai-tips");
      expect(mockValidateEnv).toHaveBeenCalledOnce();
    });

    it("does not call initVapid", async () => {
      await runJob("generate-ai-tips");
      expect(mockInitVapid).not.toHaveBeenCalled();
    });

    it("calls generateAiTips", async () => {
      await runJob("generate-ai-tips");
      expect(mockGenerateAiTips).toHaveBeenCalledOnce();
    });
  });

  describe("error propagation", () => {
    it("propagates errors thrown by the job function", async () => {
      mockRunCleanup.mockRejectedValueOnce(new Error("DB connection failed"));
      await expect(runJob("cleanup")).rejects.toThrow("DB connection failed");
    });

    it("propagates errors thrown by send-reminders", async () => {
      mockRunSendReminders.mockRejectedValueOnce(new Error("SMTP error"));
      await expect(runJob("send-reminders")).rejects.toThrow("SMTP error");
    });
  });
});
