import { describe, expect, it, vi, beforeEach } from "vitest";

const mockRequireSession = vi.fn();
vi.mock("@/lib/api/helpers", () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
}));

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }));

vi.mock("@repo/database", () => ({
  db: { select: mockSelect },
  schema: { subscriptions: {} },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ eq: [a, b] })),
  and: vi.fn((...a: unknown[]) => ({ and: a })),
  inArray: vi.fn((a: unknown, b: unknown) => ({ inArray: [a, b] })),
}));

import { GET } from "@/app/api/subscription-plan/route";

function makeSelectChain(rows: unknown[]) {
  const mockLimit = vi.fn().mockResolvedValue(rows);
  const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
  mockSelect.mockReturnValue({
    from: vi.fn().mockReturnValue({ where: mockWhere }),
  });
  return mockWhere;
}

describe("GET /api/subscription-plan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated request", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await GET(
      new Request("http://localhost/api/subscription-plan"),
    );
    expect(res.status).toBe(401);
  });

  it("returns pro plan for admin users without subscription", async () => {
    mockRequireSession.mockResolvedValue({
      session: { user: { id: "admin-1", role: "admin" } },
    });
    // DB should not be called since admin bypasses the query
    makeSelectChain([]);

    const res = await GET(
      new Request("http://localhost/api/subscription-plan"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.plan).toBe("pro");
    expect(body.status).toBe("active");
    // Admin bypass should not hit the DB
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("returns free plan for regular users without subscription", async () => {
    mockRequireSession.mockResolvedValue({
      session: { user: { id: "user-1", role: "user" } },
    });
    makeSelectChain([]);

    const res = await GET(
      new Request("http://localhost/api/subscription-plan"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.plan).toBe("free");
    expect(body.status).toBeNull();
    expect(body.isTrialing).toBe(false);
  });

  it("returns pro plan for users with active subscription", async () => {
    mockRequireSession.mockResolvedValue({
      session: { user: { id: "user-1", role: "user" } },
    });
    makeSelectChain([
      {
        id: "stripe-sub-1",
        status: "active",
        stripeSubscriptionId: "sub_123",
        trialEnd: null,
        cancelAtPeriodEnd: false,
        periodEnd: null,
      },
    ]);

    const res = await GET(
      new Request("http://localhost/api/subscription-plan"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.plan).toBe("pro");
    expect(body.status).toBe("active");
    expect(body.isTrialing).toBe(false);
  });

  it("returns free plan for users with no role set", async () => {
    mockRequireSession.mockResolvedValue({
      session: { user: { id: "user-1" } },
    });
    makeSelectChain([]);

    const res = await GET(
      new Request("http://localhost/api/subscription-plan"),
    );
    const body = await res.json();
    expect(body.plan).toBe("free");
    // DB was queried since user has no admin role
    expect(mockSelect).toHaveBeenCalled();
  });
});
