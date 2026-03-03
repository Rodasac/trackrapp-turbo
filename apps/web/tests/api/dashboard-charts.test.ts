import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequireSession, mockRequireProSubscription } = vi.hoisted(() => ({
  mockRequireSession: vi.fn(),
  mockRequireProSubscription: vi.fn(),
}));

vi.mock("@/lib/api/helpers", () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
  requireProSubscription: (...args: unknown[]) =>
    mockRequireProSubscription(...args),
}));

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }));

vi.mock("@repo/database", () => ({
  db: { select: mockSelect },
  schema: {
    trackedSubscriptions: {},
    priceHistory: {},
    categories: {},
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  inArray: vi.fn(),
}));

vi.mock("@repo/shared/billing", () => ({
  toMonthlyRate: vi.fn((price: number) => price),
}));

vi.mock("@repo/shared/dates", () => ({
  toDateString: vi.fn(() => "2026-01-01"),
}));

import { GET } from "@/app/api/dashboard/charts/route";

const fakeSession = { user: { id: "user-1" }, session: {} };

function makeSelectChain(returnValue: unknown) {
  const chain = { from: vi.fn().mockReturnThis(), where: vi.fn() };
  mockSelect.mockReturnValue(chain as never);
  chain.where.mockResolvedValue(returnValue);
  // also support direct awaiting (select().from() without where)
  (chain as unknown as { then: unknown }).then = (
    resolve: (v: unknown) => unknown,
  ) => Promise.resolve(returnValue).then(resolve);
  return chain;
}

describe("GET /api/dashboard/charts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireSession.mockResolvedValue({ session: fakeSession });
    mockRequireProSubscription.mockResolvedValue({ isPro: true });
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await GET(new Request("http://localhost/api/dashboard/charts"));
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-Pro user", async () => {
    mockRequireProSubscription.mockResolvedValue({
      error: Response.json(
        { error: "Pro subscription required" },
        { status: 403 },
      ),
    });
    const res = await GET(new Request("http://localhost/api/dashboard/charts"));
    expect(res.status).toBe(403);
  });

  it("returns empty charts when Pro user has no subscriptions", async () => {
    makeSelectChain([]);
    const res = await GET(new Request("http://localhost/api/dashboard/charts"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.spendingTrend).toEqual([]);
    expect(body.categoryBreakdown).toEqual([]);
    expect(body.topSubscriptions).toEqual([]);
  });
});
