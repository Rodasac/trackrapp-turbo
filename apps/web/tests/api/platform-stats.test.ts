import { describe, expect, it, vi, beforeEach } from "vitest";

const mockLimit = vi.fn();
const mockOrderBy = vi.fn(() => ({ limit: mockLimit }));
const mockFrom = vi.fn(() => ({ orderBy: mockOrderBy }));

vi.mock("@repo/database", () => ({
  db: {
    select: () => ({ from: mockFrom }),
  },
  schema: {
    platformStats: { computedAt: "computedAt" },
  },
}));

vi.mock("drizzle-orm", () => ({
  desc: vi.fn((a: unknown) => ({ desc: a })),
}));

import { GET } from "@/app/api/platform-stats/route";

describe("GET /api/platform-stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
  });

  it("returns the latest platform stats row", async () => {
    const fakeStats = {
      id: 1,
      totalSubscriptions: 42,
      totalUsers: 100,
      totalReminders: 500,
      totalSaved: "150.00",
      computedAt: "2026-03-01T00:00:00.000Z",
    };
    mockLimit.mockResolvedValue([fakeStats]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalSubscriptions).toBe(42);
    expect(body.totalUsers).toBe(100);
    expect(body.totalReminders).toBe(500);
    expect(body.totalSaved).toBe("150.00");
  });

  it("returns zero-value fallback when no rows exist", async () => {
    mockLimit.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalSubscriptions).toBe(0);
    expect(body.totalUsers).toBe(0);
    expect(body.totalReminders).toBe(0);
    expect(body.totalSaved).toBe("0");
    expect(body.computedAt).toBeNull();
  });

  it("queries platform_stats ordered by computedAt desc with limit 1", async () => {
    mockLimit.mockResolvedValue([]);

    await GET();

    expect(mockFrom).toHaveBeenCalledOnce();
    expect(mockOrderBy).toHaveBeenCalledOnce();
    expect(mockLimit).toHaveBeenCalledWith(1);
  });
});
