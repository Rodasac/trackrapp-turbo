import { describe, expect, it, vi, beforeEach } from "vitest";

const mockRequireSession = vi.fn();
const mockParseIdParam = vi.fn();
vi.mock("@/lib/api/helpers", () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
  parseIdParam: (...args: unknown[]) => mockParseIdParam(...args),
  validationErrorResponse: vi.fn((e) =>
    Response.json({ error: "Validation failed", issues: e.issues }, { status: 400 }),
  ),
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
    trackedSubscriptions: { id: "id", userId: "userId" },
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ eq: [a, b] })),
  and: vi.fn((...a: unknown[]) => ({ and: a })),
}));

import { PATCH } from "@/app/api/subscriptions/[id]/route";

const PARAMS = Promise.resolve({ id: "1" });
const authedSession = { user: { id: "user-1" } };

describe("PATCH /api/subscriptions/[id] (reactivate)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParseIdParam.mockReturnValue({ idNum: 1 });
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await PATCH(
      new Request("http://localhost/api/subscriptions/1", {
        method: "PATCH",
        body: JSON.stringify({ action: "reactivate" }),
      }),
      { params: PARAMS },
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when subscription not found", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    mockFindFirst.mockResolvedValue(null);
    const res = await PATCH(
      new Request("http://localhost/api/subscriptions/1", {
        method: "PATCH",
        body: JSON.stringify({ action: "reactivate" }),
      }),
      { params: PARAMS },
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 for unknown action", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    mockFindFirst.mockResolvedValue({ id: 1, isActive: false });
    const res = await PATCH(
      new Request("http://localhost/api/subscriptions/1", {
        method: "PATCH",
        body: JSON.stringify({ action: "unknown" }),
      }),
      { params: PARAMS },
    );
    expect(res.status).toBe(400);
  });

  it("reactivates a deactivated subscription", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    mockFindFirst.mockResolvedValue({ id: 1, isActive: false });
    const reactivated = { id: 1, isActive: true, deactivatedAt: null };
    mockUpdate.mockResolvedValue([reactivated]);

    const res = await PATCH(
      new Request("http://localhost/api/subscriptions/1", {
        method: "PATCH",
        body: JSON.stringify({ action: "reactivate" }),
      }),
      { params: PARAMS },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isActive).toBe(true);
    expect(json.deactivatedAt).toBeNull();
  });
});
