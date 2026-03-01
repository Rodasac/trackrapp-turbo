import { describe, expect, it, vi, beforeEach } from "vitest";

const mockRequireSession = vi.fn();
vi.mock("@/lib/api/helpers", () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
}));

const mockFindFirst = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@repo/database", () => ({
  db: {
    query: {
      userPreferences: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
    insert: () => ({ values: () => ({ onConflictDoNothing: () => ({ returning: mockInsert }) }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: mockUpdate }) }) }),
  },
  schema: {
    userPreferences: { userId: "userId" },
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ eq: [a, b] })),
}));

import { GET, PUT } from "@/app/api/user-preferences/route";

const authedSession = { user: { id: "user-1" } };

describe("GET /api/user-preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await GET(new Request("http://localhost/api/user-preferences"));
    expect(res.status).toBe(401);
  });

  it("returns existing preferences", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    mockFindFirst.mockResolvedValue({ userId: "user-1", autoRenewDefault: false });
    // no insert call expected since prefs exist
    mockInsert.mockResolvedValue([]);

    const res = await GET(new Request("http://localhost/api/user-preferences"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.autoRenewDefault).toBe(false);
  });

  it("creates default preferences when none exist", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    mockFindFirst
      .mockResolvedValueOnce(null) // first call: no existing
      .mockResolvedValueOnce({ userId: "user-1", autoRenewDefault: true }); // after upsert
    mockInsert.mockResolvedValue([]);

    const res = await GET(new Request("http://localhost/api/user-preferences"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.autoRenewDefault).toBe(true);
  });
});

describe("PUT /api/user-preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await PUT(
      new Request("http://localhost/api/user-preferences", {
        method: "PUT",
        body: JSON.stringify({ autoRenewDefault: false }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    const res = await PUT(
      new Request("http://localhost/api/user-preferences", {
        method: "PUT",
        body: JSON.stringify({ autoRenewDefault: "not-a-bool" }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("updates autoRenewDefault", async () => {
    mockRequireSession.mockResolvedValue({ session: authedSession });
    const updated = { userId: "user-1", autoRenewDefault: false };
    mockUpdate.mockResolvedValue([updated]);
    mockInsert.mockResolvedValue([]);

    const res = await PUT(
      new Request("http://localhost/api/user-preferences", {
        method: "PUT",
        body: JSON.stringify({ autoRenewDefault: false }),
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.autoRenewDefault).toBe(false);
  });
});
