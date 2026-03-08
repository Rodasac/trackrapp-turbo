import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../src/logger.js", () => {
  const noop = () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
  });
  return {
    autoRenewLog: noop(),
    workerLog: noop(),
    remindersLog: noop(),
    cleanupLog: noop(),
    aiTipsLog: noop(),
    runJobLog: noop(),
    aiServiceLog: noop(),
  };
});

const {
  mockValidateAiEnv,
  mockGenerateTipsForUser,
  mockGetAiModel,
  mockCreateNotification,
  mockDeleteWhere,
  mockInsertValues,
  mockSelectResult,
  mockSelect,
} = vi.hoisted(() => {
  const mockSelectResult = vi.fn();
  const mockSelectWhere = vi.fn(() => mockSelectResult());
  const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
  const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));
  return {
    mockValidateAiEnv: vi.fn(),
    mockGenerateTipsForUser: vi.fn(),
    mockGetAiModel: vi.fn(() => "mock-model"),
    mockCreateNotification: vi.fn().mockResolvedValue(1),
    mockDeleteWhere: vi.fn().mockResolvedValue({ rowCount: 2 } as never),
    mockInsertValues: vi.fn().mockResolvedValue(undefined),
    mockSelectResult,
    mockSelectWhere,
    mockSelectFrom,
    mockSelect,
  };
});

vi.mock("../../src/env.js", () => ({
  validateEnv: vi.fn(),
  validateAiEnv: mockValidateAiEnv,
}));

vi.mock("../../src/services/ai.js", () => ({
  getAiModel: mockGetAiModel,
  generateTipsForUser: mockGenerateTipsForUser,
}));

vi.mock("../../src/services/notification.js", () => ({
  createNotification: mockCreateNotification,
}));

vi.mock("@repo/database", () => ({
  db: {
    select: mockSelect,
    insert: vi.fn(() => ({ values: mockInsertValues })),
    delete: vi.fn(() => ({ where: mockDeleteWhere })),
  },
  schema: {
    subscriptions: { referenceId: "referenceId", status: "status" },
    trackedSubscriptions: { userId: "userId", isActive: "isActive" },
    categories: {},
    aiTips: { userId: "userId" },
    users: { id: "id", role: "role" },
    userPreferences: { userId: "userId" },
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ eq: [a, b] })),
  and: vi.fn((...a: unknown[]) => ({ and: a })),
  inArray: vi.fn((a: unknown, b: unknown) => ({ inArray: [a, b] })),
}));

vi.mock("@repo/shared/i18n", () => ({
  getTranslator: vi.fn(() => (key: string) => key),
}));

import { generateAiTips } from "../../src/jobs/generate-ai-tips.js";

const PRO_USER = { referenceId: "user-1" };
const SUB_DATA = [
  {
    id: 1,
    name: "Netflix",
    price: "15.99",
    currency: "USD",
    billingCycle: "monthly",
    isActive: true,
    category: { name: "Streaming" },
  },
];

describe("generate-ai-tips job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateAiEnv.mockReturnValue({
      provider: "anthropic",
      apiKey: "sk-ant-test",
    });
    mockGenerateTipsForUser.mockResolvedValue([
      { title: "Save money", message: "Switch to annual", category: "savings" },
    ]);
  });

  it("returns early when no API key is configured", async () => {
    mockValidateAiEnv.mockReturnValue(null);
    await generateAiTips();
    expect(mockGetAiModel).not.toHaveBeenCalled();
  });

  it("queries Pro users and generates tips", async () => {
    mockSelectResult
      .mockResolvedValueOnce([PRO_USER]) // Pro users
      .mockResolvedValueOnce([]) // admin users (none)
      .mockResolvedValueOnce([]) // user preferences (none)
      .mockResolvedValueOnce(SUB_DATA); // user's subscriptions

    await generateAiTips();
    expect(mockGetAiModel).toHaveBeenCalledWith("anthropic");
    expect(mockGenerateTipsForUser).toHaveBeenCalledOnce();
  });

  it("skips users with 0 active subscriptions", async () => {
    mockSelectResult
      .mockResolvedValueOnce([PRO_USER]) // Pro users
      .mockResolvedValueOnce([]) // admin users (none)
      .mockResolvedValueOnce([]) // user preferences (none)
      .mockResolvedValueOnce([]); // no subscriptions

    await generateAiTips();
    expect(mockGenerateTipsForUser).not.toHaveBeenCalled();
  });

  it("deletes old tips before inserting new ones", async () => {
    const { db } = await import("@repo/database");
    mockSelectResult
      .mockResolvedValueOnce([PRO_USER])
      .mockResolvedValueOnce([]) // admin users (none)
      .mockResolvedValueOnce([]) // user preferences (none)
      .mockResolvedValueOnce(SUB_DATA);

    await generateAiTips();
    expect(db.delete).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
  });

  it("creates a notification after generating tips", async () => {
    mockSelectResult
      .mockResolvedValueOnce([PRO_USER])
      .mockResolvedValueOnce([]) // admin users (none)
      .mockResolvedValueOnce([]) // user preferences (none)
      .mockResolvedValueOnce(SUB_DATA);

    await generateAiTips();
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        type: "tip",
      }),
    );
  });

  it("continues processing other users when one fails", async () => {
    const users = [{ referenceId: "user-1" }, { referenceId: "user-2" }];
    mockSelectResult
      .mockResolvedValueOnce(users)
      .mockResolvedValueOnce([]) // admin users (none)
      .mockResolvedValueOnce([]) // user preferences (none, batch)
      // user-1 subs → error during generation
      .mockResolvedValueOnce(SUB_DATA)
      // user-2 subs
      .mockResolvedValueOnce(SUB_DATA);

    mockGenerateTipsForUser
      .mockRejectedValueOnce(new Error("API error"))
      .mockResolvedValueOnce([
        { title: "Tip", message: "Msg", category: "info" },
      ]);

    await generateAiTips();
    // Should still process user-2
    expect(mockGenerateTipsForUser).toHaveBeenCalledTimes(2);
  });

  it("returns early when no eligible users exist", async () => {
    mockSelectResult
      .mockResolvedValueOnce([]) // no Pro users
      .mockResolvedValueOnce([]); // no admin users

    await generateAiTips();
    expect(mockGenerateTipsForUser).not.toHaveBeenCalled();
  });

  it("does not create notification when AI returns empty tips", async () => {
    mockSelectResult
      .mockResolvedValueOnce([PRO_USER])
      .mockResolvedValueOnce([]) // admin users (none)
      .mockResolvedValueOnce([]) // user preferences (none)
      .mockResolvedValueOnce(SUB_DATA);
    mockGenerateTipsForUser.mockResolvedValue([]);

    await generateAiTips();
    expect(mockCreateNotification).not.toHaveBeenCalled();
  });

  it("includes admin users in eligible users", async () => {
    const ADMIN_USER = { id: "admin-1" };
    mockSelectResult
      .mockResolvedValueOnce([]) // no Pro users
      .mockResolvedValueOnce([ADMIN_USER]) // admin users
      .mockResolvedValueOnce([]) // user preferences (none)
      .mockResolvedValueOnce(SUB_DATA); // admin user's subscriptions

    await generateAiTips();
    expect(mockGenerateTipsForUser).toHaveBeenCalledOnce();
  });

  it("deduplicates admin + Pro users", async () => {
    // user-1 appears in both Pro subscriptions and admin users
    const SHARED_USER_PRO = { referenceId: "user-1" };
    const SHARED_USER_ADMIN = { id: "user-1" };
    mockSelectResult
      .mockResolvedValueOnce([SHARED_USER_PRO]) // Pro users
      .mockResolvedValueOnce([SHARED_USER_ADMIN]) // admin users (same person)
      .mockResolvedValueOnce([]) // user preferences (none)
      .mockResolvedValueOnce(SUB_DATA); // subscriptions (called only once)

    await generateAiTips();
    // Should only process user-1 once despite appearing in both lists
    expect(mockGenerateTipsForUser).toHaveBeenCalledOnce();
  });

  it("passes es locale to generateTipsForUser when user has Spanish preference", async () => {
    const USER_PREF_ES = { userId: "user-1", locale: "es" };
    mockSelectResult
      .mockResolvedValueOnce([PRO_USER])
      .mockResolvedValueOnce([]) // admin users (none)
      .mockResolvedValueOnce([USER_PREF_ES]) // user preferences
      .mockResolvedValueOnce(SUB_DATA);

    await generateAiTips();
    expect(mockGenerateTipsForUser).toHaveBeenCalledWith(
      "mock-model",
      expect.any(Array),
      expect.any(Number),
      "es",
    );
  });

  it("defaults to en locale when no preferences exist for user", async () => {
    mockSelectResult
      .mockResolvedValueOnce([PRO_USER])
      .mockResolvedValueOnce([]) // admin users (none)
      .mockResolvedValueOnce([]) // no user preferences
      .mockResolvedValueOnce(SUB_DATA);

    await generateAiTips();
    expect(mockGenerateTipsForUser).toHaveBeenCalledWith(
      "mock-model",
      expect.any(Array),
      expect.any(Number),
      "en",
    );
  });

  it("uses translated notification strings for es locale", async () => {
    const { getTranslator } = await import("@repo/shared/i18n");
    const mockT = vi.fn((key: string) => `translated:${key}`);
    vi.mocked(getTranslator).mockReturnValue(mockT);

    const USER_PREF_ES = { userId: "user-1", locale: "es" };
    mockSelectResult
      .mockResolvedValueOnce([PRO_USER])
      .mockResolvedValueOnce([]) // admin users (none)
      .mockResolvedValueOnce([USER_PREF_ES]) // user preferences
      .mockResolvedValueOnce(SUB_DATA);

    await generateAiTips();
    expect(getTranslator).toHaveBeenCalledWith("es", "notification");
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "translated:aiTips.title",
      }),
    );
  });
});
