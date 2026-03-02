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
  mockDeleteExecute,
  mockDeleteWhere,
  mockDelete,
  mockUpdateExecute,
  mockUpdateWhere,
  mockUpdateSet,
  mockUpdate,
} = vi.hoisted(() => {
  const mockDeleteExecute = vi.fn().mockResolvedValue({ rowCount: 2 });
  const mockDeleteWhere = vi.fn(() => ({ execute: mockDeleteExecute }));
  const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));

  const mockUpdateExecute = vi.fn().mockResolvedValue({ rowCount: 0 });
  const mockUpdateWhere = vi.fn(() => ({ execute: mockUpdateExecute }));
  const mockUpdateSet = vi.fn(() => ({ where: mockUpdateWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockUpdateSet }));

  return {
    mockDeleteExecute,
    mockDeleteWhere,
    mockDelete,
    mockUpdateExecute,
    mockUpdateWhere,
    mockUpdateSet,
    mockUpdate,
  };
});

vi.mock("@repo/database", () => ({
  db: { delete: mockDelete, update: mockUpdate },
  schema: {
    notifications: {
      isRead: "isRead",
      createdAt: "createdAt",
    },
    trackedSubscriptions: {
      previousRenewalDate: "previousRenewalDate",
    },
  },
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...args: unknown[]) => ({ type: "and", args })),
  eq: vi.fn((a: unknown, b: unknown) => ({ type: "eq", a, b })),
  lt: vi.fn((a: unknown, b: unknown) => ({ type: "lt", a, b })),
  isNotNull: vi.fn((a: unknown) => ({ type: "isNotNull", a })),
}));

vi.mock("@repo/shared/dates", () => ({
  toDateString: vi.fn(() => "2026-02-01"),
}));

import { db, schema } from "@repo/database";
import { lt, eq, and, isNotNull } from "drizzle-orm";
import { runCleanup } from "../../src/jobs/cleanup.js";

describe("cleanup job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteExecute.mockResolvedValue({ rowCount: 2 });
    mockUpdateExecute.mockResolvedValue({ rowCount: 0 });
    mockDelete.mockReturnValue({ where: mockDeleteWhere });
    mockDeleteWhere.mockReturnValue({ execute: mockDeleteExecute });
    mockUpdate.mockReturnValue({ set: mockUpdateSet });
    mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdateWhere.mockReturnValue({ execute: mockUpdateExecute });
  });

  it("deletes read notifications older than 30 days", async () => {
    await runCleanup();
    expect(db.delete).toHaveBeenCalledWith(schema.notifications);
    expect(and).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith(schema.notifications.isRead, true);
    expect(lt).toHaveBeenCalled();
  });

  it("clears stale previousRenewalDate values older than 30 days", async () => {
    await runCleanup();
    expect(db.update).toHaveBeenCalledWith(schema.trackedSubscriptions);
    expect(isNotNull).toHaveBeenCalledWith(
      schema.trackedSubscriptions.previousRenewalDate,
    );
  });

  it("calls delete exactly once", async () => {
    await runCleanup();
    expect(db.delete).toHaveBeenCalledOnce();
  });

  it("returns the count of deleted notifications", async () => {
    mockDeleteExecute.mockResolvedValue({ rowCount: 5 });
    const count = await runCleanup();
    expect(count).toBe(5);
  });
});
