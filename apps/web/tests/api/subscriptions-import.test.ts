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

const { mockInsert } = vi.hoisted(() => ({ mockInsert: vi.fn() }));

vi.mock("@repo/database", () => ({
  db: {
    insert: mockInsert,
  },
  schema: {
    trackedSubscriptions: {},
    priceHistory: {},
  },
}));

import { POST } from "@/app/api/subscriptions/import/route";

const fakeSession = { user: { id: "user-1" }, session: {} };

const validRow = {
  name: "Netflix",
  price: "15.99",
  currency: "USD",
  billingCycle: "monthly" as const,
  nextRenewalDate: "2026-03-15",
  categoryId: null,
  serviceCatalogId: null,
  logoUrl: null,
  websiteUrl: null,
};

function makeInsertChain(returnValue: unknown) {
  const chain = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(returnValue),
  };
  mockInsert.mockReturnValue(chain);
  return chain;
}

describe("POST /api/subscriptions/import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireSession.mockResolvedValue({ session: fakeSession });
    mockRequireProSubscription.mockResolvedValue({ isPro: true });
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const req = new Request("http://localhost/api/subscriptions/import", {
      method: "POST",
      body: JSON.stringify({ rows: [validRow] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-Pro user", async () => {
    mockRequireProSubscription.mockResolvedValue({
      error: Response.json(
        { error: "Pro subscription required" },
        { status: 403 },
      ),
    });
    const req = new Request("http://localhost/api/subscriptions/import", {
      method: "POST",
      body: JSON.stringify({ rows: [validRow] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("bulk inserts subscriptions and returns count", async () => {
    const insertedSub = { id: 1, price: "15.99" };
    makeInsertChain([insertedSub]);
    const req = new Request("http://localhost/api/subscriptions/import", {
      method: "POST",
      body: JSON.stringify({ rows: [validRow] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.imported).toBe(1);
    expect(body.failed).toBe(0);
  });

  it("creates price history entry per row", async () => {
    const insertedSub = { id: 1, price: "15.99" };
    const chain = makeInsertChain([insertedSub]);
    const req = new Request("http://localhost/api/subscriptions/import", {
      method: "POST",
      body: JSON.stringify({ rows: [validRow] }),
    });
    await POST(req);
    // insert called twice: once for subscription, once for price history
    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(chain.values).toHaveBeenCalledTimes(2);
  });

  it("reports per-row errors without blocking other rows", async () => {
    let callCount = 0;
    mockInsert.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First subscription insert fails
        return {
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockRejectedValue(new Error("DB error")),
        };
      }
      // Second subscription insert succeeds
      return {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 2, price: "9.99" }]),
      };
    });

    const rows = [validRow, { ...validRow, name: "Spotify", price: "9.99" }];
    const req = new Request("http://localhost/api/subscriptions/import", {
      method: "POST",
      body: JSON.stringify({ rows }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.imported).toBe(1);
    expect(body.failed).toBe(1);
    expect(body.errors).toHaveLength(1);
    expect(body.errors[0].rowIndex).toBe(0);
  });

  it("returns 0 imported for empty rows array", async () => {
    const req = new Request("http://localhost/api/subscriptions/import", {
      method: "POST",
      body: JSON.stringify({ rows: [] }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.imported).toBe(0);
    expect(body.failed).toBe(0);
  });
});
