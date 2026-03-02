import { describe, it, expect, vi, beforeEach } from "vitest";

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
    platformStatsLog: noop(),
    autoRenewLog: noop(),
    workerLog: noop(),
    remindersLog: noop(),
    cleanupLog: noop(),
    aiTipsLog: noop(),
    runJobLog: noop(),
    aiServiceLog: noop(),
  };
});

const { mockFrom, mockInsert } = vi.hoisted(() => {
  const mockInsert = vi.fn().mockResolvedValue(undefined);
  const mockFrom = vi.fn();
  return { mockFrom, mockInsert };
});

vi.mock("@repo/database", () => ({
  db: {
    select: vi.fn(() => ({ from: mockFrom })),
    insert: vi.fn(() => ({ values: mockInsert })),
  },
  schema: {
    trackedSubscriptions: {
      isActive: "isActive",
      price: "price",
      billingCycle: "billingCycle",
    },
    users: {},
    notifications: { type: "type" },
    platformStats: {},
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ eq: [a, b] })),
  count: vi.fn(() => "count_expr"),
}));

vi.mock("@repo/shared/billing", () => ({
  toMonthlyRate: vi.fn((price: number) => price),
}));

import { computePlatformStats } from "../../src/jobs/compute-platform-stats.js";

describe("computePlatformStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue(undefined);
  });

  it("queries all four data sources and inserts aggregated stats", async () => {
    // Call 1: totalSubscriptions — direct await on from()
    // Call 2: totalUsers — direct await on from()
    // Call 3: totalReminders — from().where()
    // Call 4: deactivated subs — from().where()
    mockFrom
      .mockResolvedValueOnce([{ count: 42 }])
      .mockResolvedValueOnce([{ count: 100 }])
      .mockReturnValueOnce({
        where: vi.fn().mockResolvedValue([{ count: 500 }]),
      })
      .mockReturnValueOnce({
        where: vi.fn().mockResolvedValue([
          { price: "10", billingCycle: "monthly" },
          { price: "5", billingCycle: "monthly" },
        ]),
      });

    await computePlatformStats();

    expect(mockInsert).toHaveBeenCalledOnce();
    const insertArg = mockInsert.mock.calls[0][0] as {
      totalSubscriptions: number;
      totalUsers: number;
      totalReminders: number;
      totalSaved: string;
    };
    expect(insertArg.totalSubscriptions).toBe(42);
    expect(insertArg.totalUsers).toBe(100);
    expect(insertArg.totalReminders).toBe(500);
    // toMonthlyRate is mocked to return price as-is: 10 + 5 = 15
    expect(insertArg.totalSaved).toBe("15.00");
  });

  it("inserts 0.00 totalSaved when there are no deactivated subscriptions", async () => {
    mockFrom
      .mockResolvedValueOnce([{ count: 0 }])
      .mockResolvedValueOnce([{ count: 0 }])
      .mockReturnValueOnce({ where: vi.fn().mockResolvedValue([{ count: 0 }]) })
      .mockReturnValueOnce({ where: vi.fn().mockResolvedValue([]) });

    await computePlatformStats();

    expect(mockInsert).toHaveBeenCalledOnce();
    const insertArg = mockInsert.mock.calls[0][0] as { totalSaved: string };
    expect(insertArg.totalSaved).toBe("0.00");
  });

  it("formats totalSaved as a fixed-decimal string", async () => {
    mockFrom
      .mockResolvedValueOnce([{ count: 5 }])
      .mockResolvedValueOnce([{ count: 3 }])
      .mockReturnValueOnce({
        where: vi.fn().mockResolvedValue([{ count: 10 }]),
      })
      .mockReturnValueOnce({
        where: vi
          .fn()
          .mockResolvedValue([{ price: "7.5", billingCycle: "monthly" }]),
      });

    await computePlatformStats();

    const insertArg = mockInsert.mock.calls[0][0] as { totalSaved: string };
    // toMonthlyRate mock returns price as-is: 7.5
    expect(insertArg.totalSaved).toBe("7.50");
  });
});
