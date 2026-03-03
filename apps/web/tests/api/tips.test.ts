import { describe, expect, it, vi, beforeEach } from "vitest";

const mockRequireSession = vi.fn();
const mockRequireProSubscription = vi.fn();
vi.mock("@/lib/api/helpers", () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
  requireProSubscription: (...args: unknown[]) =>
    mockRequireProSubscription(...args),
}));

const mockDbFrom = vi.fn(() => ({ where: vi.fn() }));
vi.mock("@repo/database", () => ({
  db: {
    select: () => ({ from: mockDbFrom }),
  },
  schema: {
    aiTips: { userId: "userId", expiresAt: "expiresAt" },
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ eq: [a, b] })),
  and: vi.fn((...a: unknown[]) => ({ and: a })),
  gt: vi.fn((a: unknown, b: unknown) => ({ gt: [a, b] })),
  desc: vi.fn((a: unknown) => ({ desc: a })),
}));

import { GET } from "@/app/api/tips/route";

describe("GET /api/tips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireSession.mockResolvedValue({
      session: { user: { id: "user-1" } },
    });
    mockRequireProSubscription.mockResolvedValue({ isPro: true });
  });

  it("returns 401 for unauthenticated request", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await GET(new Request("http://localhost/api/tips"));
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-Pro user", async () => {
    mockRequireProSubscription.mockResolvedValue({
      error: Response.json(
        { error: "Pro subscription required" },
        { status: 403 },
      ),
    });
    const res = await GET(new Request("http://localhost/api/tips"));
    expect(res.status).toBe(403);
  });

  it("returns tips for Pro user", async () => {
    const mockTips = [
      {
        id: 1,
        title: "Save",
        message: "Switch annual",
        category: "savings",
        generatedAt: new Date(),
        expiresAt: new Date(),
      },
    ];
    mockDbFrom.mockReturnValue({
      where: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValueOnce(mockTips),
      }),
    });
    const res = await GET(new Request("http://localhost/api/tips"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("Save");
  });

  it("returns empty array when Pro user has no tips", async () => {
    mockDbFrom.mockReturnValue({
      where: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValueOnce([]),
      }),
    });
    const res = await GET(new Request("http://localhost/api/tips"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });
});
