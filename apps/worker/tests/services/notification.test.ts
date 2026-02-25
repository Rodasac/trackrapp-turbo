import { describe, it, expect, vi, beforeEach } from "vitest";
import { and, eq, gte } from "drizzle-orm";

// All vi.fn() are defined *inside* the factory so hoisting works correctly.
vi.mock("@repo/database", () => {
  const mockLimit = vi.fn().mockResolvedValue([]);
  const mockWhere = vi.fn(() => ({ limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));

  const mockReturning = vi.fn().mockResolvedValue([{ id: 1 }]);
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));

  return {
    db: {
      insert: mockInsert,
      select: mockSelect,
    },
    schema: {
      notifications: {
        userId: "userId",
        type: "type",
        relatedSubscriptionId: "relatedSubscriptionId",
        isRead: "isRead",
        createdAt: "createdAt",
      },
    },
  };
});

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...args: unknown[]) => ({ type: "and", args })),
  eq: vi.fn((a: unknown, b: unknown) => ({ type: "eq", a, b })),
  gte: vi.fn((a: unknown, b: unknown) => ({ type: "gte", a, b })),
}));

import { db, schema } from "@repo/database";
import {
  createNotification,
  hasExistingReminder,
} from "../../src/services/notification.js";

describe("notification service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup return values after clearAllMocks
    const mockReturning = vi.fn().mockResolvedValue([{ id: 1 }]);
    const mockValues = vi.fn(() => ({ returning: mockReturning }));
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as ReturnType<
      typeof db.insert
    >);

    const mockLimit = vi.fn().mockResolvedValue([]);
    const mockWhere = vi.fn(() => ({ limit: mockLimit }));
    const mockFrom = vi.fn(() => ({ where: mockWhere }));
    vi.mocked(db.select).mockReturnValue({
      from: mockFrom,
    } as ReturnType<typeof db.select>);
  });

  describe("createNotification", () => {
    it("inserts a notification and returns its id", async () => {
      const result = await createNotification({
        userId: "user-123",
        type: "renewal_reminder",
        title: "Netflix renews tomorrow",
        message: "Your Netflix subscription renews tomorrow for $15.99",
        relatedSubscriptionId: 42,
      });
      expect(db.insert).toHaveBeenCalledWith(schema.notifications);
      expect(result).toBe(1);
    });

    it("inserts notification without relatedSubscriptionId", async () => {
      await createNotification({
        userId: "user-456",
        type: "system",
        title: "Welcome",
        message: "Welcome to TrackrApp!",
      });
      expect(db.insert).toHaveBeenCalledWith(schema.notifications);
    });
  });

  describe("hasExistingReminder", () => {
    it("returns false when no existing reminder found", async () => {
      const result = await hasExistingReminder(42, "2026-03-01");
      expect(result).toBe(false);
      expect(db.select).toHaveBeenCalled();
      expect(eq).toHaveBeenCalledWith(
        schema.notifications.relatedSubscriptionId,
        42,
      );
      expect(eq).toHaveBeenCalledWith(
        schema.notifications.type,
        "renewal_reminder",
      );
      expect(gte).toHaveBeenCalled();
      expect(and).toHaveBeenCalled();
    });

    it("returns true when existing reminder found", async () => {
      // Override the limit mock to return a row
      const mockLimit = vi.fn().mockResolvedValue([{ id: 5 }]);
      const mockWhere = vi.fn(() => ({ limit: mockLimit }));
      const mockFrom = vi.fn(() => ({ where: mockWhere }));
      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as ReturnType<typeof db.select>);

      const result = await hasExistingReminder(42, "2026-03-01");
      expect(result).toBe(true);
    });
  });
});
