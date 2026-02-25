import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@repo/database", () => {
  const mockExecute = vi.fn().mockResolvedValue({ rowCount: 2 });
  const mockWhere = vi.fn(() => ({ execute: mockExecute }));
  const mockDelete = vi.fn(() => ({ where: mockWhere }));

  return {
    db: { delete: mockDelete },
    schema: {
      notifications: {
        isRead: "isRead",
        createdAt: "createdAt",
      },
    },
  };
});

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...args: unknown[]) => ({ type: "and", args })),
  eq: vi.fn((a: unknown, b: unknown) => ({ type: "eq", a, b })),
  lt: vi.fn((a: unknown, b: unknown) => ({ type: "lt", a, b })),
}));

import { db, schema } from "@repo/database";
import { lt, eq, and } from "drizzle-orm";
import { runCleanup } from "../../src/jobs/cleanup.js";

describe("cleanup job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockExecute = vi.fn().mockResolvedValue({ rowCount: 2 });
    const mockWhere = vi.fn(() => ({ execute: mockExecute }));
    vi.mocked(db.delete).mockReturnValue({
      where: mockWhere,
    } as ReturnType<typeof db.delete>);
  });

  it("deletes read notifications older than 30 days", async () => {
    await runCleanup();
    expect(db.delete).toHaveBeenCalledWith(schema.notifications);
    expect(and).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith(schema.notifications.isRead, true);
    expect(lt).toHaveBeenCalled();
  });

  it("calls delete exactly once", async () => {
    await runCleanup();
    expect(db.delete).toHaveBeenCalledOnce();
  });

  it("returns the count of deleted rows", async () => {
    const mockExecute = vi.fn().mockResolvedValue({ rowCount: 5 });
    const mockWhere = vi.fn(() => ({ execute: mockExecute }));
    vi.mocked(db.delete).mockReturnValue({
      where: mockWhere,
    } as ReturnType<typeof db.delete>);

    const count = await runCleanup();
    expect(count).toBe(5);
  });
});
