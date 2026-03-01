import { describe, expect, it, vi, beforeEach } from "vitest";

const mockRequireSession = vi.fn();
const mockParseIdParam = vi.fn();
vi.mock("@/lib/api/helpers", () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
  parseIdParam: (...args: unknown[]) => mockParseIdParam(...args),
}));

const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();
vi.mock("@repo/database", () => ({
  db: {
    query: {
      trackedSubscriptions: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
    update: () => ({
      set: () => ({ where: () => ({ returning: mockUpdate }) }),
    }),
  },
  schema: {
    trackedSubscriptions: {
      id: "id",
      userId: "userId",
      nextRenewalDate: "nextRenewalDate",
      previousRenewalDate: "previousRenewalDate",
    },
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ eq: [a, b] })),
  and: vi.fn((...a: unknown[]) => ({ and: a })),
}));

vi.mock("@repo/shared/billing", () => ({
  computeNextRenewalDate: vi.fn(() => "2026-04-01"),
}));

import { POST, DELETE } from "@/app/api/subscriptions/[id]/renew/route";

const PARAMS = Promise.resolve({ id: "1" });
const authedSession = { user: { id: "user-1" } };

describe("POST /api/subscriptions/[id]/renew", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParseIdParam.mockReturnValue({ idNum: 1 });
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await POST(new Request("http://localhost/api/subscriptions/1/renew"), {
      params: PARAMS,
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when subscription not found", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    mockFindFirst.mockResolvedValue(null);
    const res = await POST(new Request("http://localhost/api/subscriptions/1/renew"), {
      params: PARAMS,
    });
    expect(res.status).toBe(404);
  });

  it("advances renewal date by one billing cycle", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    mockFindFirst.mockResolvedValue({
      id: 1,
      nextRenewalDate: "2026-03-01",
      billingCycle: "monthly",
    });
    const updatedSub = {
      id: 1,
      nextRenewalDate: "2026-04-01",
      previousRenewalDate: "2026-03-01",
    };
    mockUpdate.mockResolvedValue([updatedSub]);

    const res = await POST(new Request("http://localhost/api/subscriptions/1/renew"), {
      params: PARAMS,
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.nextRenewalDate).toBe("2026-04-01");
    expect(json.previousRenewalDate).toBe("2026-03-01");
  });
});

describe("DELETE /api/subscriptions/[id]/renew (undo)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParseIdParam.mockReturnValue({ idNum: 1 });
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await DELETE(new Request("http://localhost/api/subscriptions/1/renew"), {
      params: PARAMS,
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when subscription not found", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    mockFindFirst.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost/api/subscriptions/1/renew"), {
      params: PARAMS,
    });
    expect(res.status).toBe(404);
  });

  it("returns 400 when no previousRenewalDate to undo", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    mockFindFirst.mockResolvedValue({
      id: 1,
      nextRenewalDate: "2026-04-01",
      previousRenewalDate: null,
    });
    const res = await DELETE(new Request("http://localhost/api/subscriptions/1/renew"), {
      params: PARAMS,
    });
    expect(res.status).toBe(400);
  });

  it("reverts nextRenewalDate to previousRenewalDate", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    mockFindFirst.mockResolvedValue({
      id: 1,
      nextRenewalDate: "2026-04-01",
      previousRenewalDate: "2026-03-01",
    });
    const undoneData = {
      id: 1,
      nextRenewalDate: "2026-03-01",
      previousRenewalDate: null,
    };
    mockUpdate.mockResolvedValue([undoneData]);

    const res = await DELETE(new Request("http://localhost/api/subscriptions/1/renew"), {
      params: PARAMS,
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.nextRenewalDate).toBe("2026-03-01");
    expect(json.previousRenewalDate).toBeNull();
  });
});
