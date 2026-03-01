import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindMany = vi.fn();
const mockSelectFrom = vi.fn();
const mockUpdateSet = vi.fn();

vi.mock("@repo/database", () => ({
  db: {
    query: {
      trackedSubscriptions: {
        findMany: (...args: unknown[]) => mockFindMany(...args),
      },
    },
    select: () => ({ from: () => ({ where: mockSelectFrom }) }),
    update: () => ({
      set: () => ({ where: () => ({ execute: mockUpdateSet }) }),
    }),
  },
  schema: {
    trackedSubscriptions: {
      id: "id",
      isActive: "isActive",
      nextRenewalDate: "nextRenewalDate",
      autoRenew: "autoRenew",
      previousRenewalDate: "previousRenewalDate",
      userId: "userId",
    },
    userPreferences: {
      userId: "userId",
      autoRenewDefault: "autoRenewDefault",
    },
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ eq: [a, b] })),
  and: vi.fn((...a: unknown[]) => ({ and: a })),
  lte: vi.fn((a: unknown, b: unknown) => ({ lte: [a, b] })),
  inArray: vi.fn((a: unknown, b: unknown) => ({ inArray: [a, b] })),
}));

vi.mock("@repo/shared/billing", () => ({
  computeNextRenewalDate: vi.fn(() => "2026-04-01"),
}));

vi.mock("@repo/shared/dates", () => ({
  toDateString: vi.fn(() => "2026-03-01"),
}));

import { runAutoRenew } from "../../src/jobs/auto-renew.js";
import { computeNextRenewalDate } from "@repo/shared/billing";

const makeSub = (overrides = {}) => ({
  id: 1,
  userId: "user-1",
  nextRenewalDate: "2026-03-01",
  billingCycle: "monthly",
  autoRenew: null,
  ...overrides,
});

describe("auto-renew job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateSet.mockResolvedValue({ rowCount: 1 });
    mockSelectFrom.mockResolvedValue([]); // default: no user prefs rows
  });

  it("returns 0 when no subscriptions are due", async () => {
    mockFindMany.mockResolvedValue([]);
    const count = await runAutoRenew();
    expect(count).toBe(0);
  });

  it("auto-renews when autoRenew is explicitly true", async () => {
    mockFindMany.mockResolvedValue([makeSub({ autoRenew: true })]);
    const count = await runAutoRenew();
    expect(count).toBe(1);
    expect(computeNextRenewalDate).toHaveBeenCalledWith(
      "2026-03-01",
      "monthly",
    );
  });

  it("skips when autoRenew is explicitly false", async () => {
    mockFindMany.mockResolvedValue([makeSub({ autoRenew: false })]);
    const count = await runAutoRenew();
    expect(count).toBe(0);
  });

  it("uses global default true when autoRenew is null and no prefs row", async () => {
    mockFindMany.mockResolvedValue([makeSub({ autoRenew: null })]);
    mockSelectFrom.mockResolvedValue([]); // no pref row → default true
    const count = await runAutoRenew();
    expect(count).toBe(1);
  });

  it("respects global default false when autoRenew is null", async () => {
    mockFindMany.mockResolvedValue([makeSub({ autoRenew: null })]);
    mockSelectFrom.mockResolvedValue([
      { userId: "user-1", autoRenewDefault: false },
    ]);
    const count = await runAutoRenew();
    expect(count).toBe(0);
  });

  it("renews multiple subscriptions and returns correct count", async () => {
    mockFindMany.mockResolvedValue([
      makeSub({ id: 1, autoRenew: true }),
      makeSub({ id: 2, autoRenew: true, userId: "user-2" }),
    ]);
    const count = await runAutoRenew();
    expect(count).toBe(2);
  });

  it("sets previousRenewalDate to old nextRenewalDate", async () => {
    mockFindMany.mockResolvedValue([makeSub({ autoRenew: true })]);
    await runAutoRenew();
    expect(computeNextRenewalDate).toHaveBeenCalledWith(
      "2026-03-01",
      "monthly",
    );
  });

  it("continues processing when one subscription update fails", async () => {
    mockFindMany.mockResolvedValue([
      makeSub({ id: 1, autoRenew: true }),
      makeSub({ id: 2, autoRenew: true, userId: "user-2" }),
    ]);
    mockUpdateSet
      .mockRejectedValueOnce(new Error("DB error"))
      .mockResolvedValueOnce({ rowCount: 1 });

    const count = await runAutoRenew();
    expect(count).toBe(1); // second one succeeded
  });
});
