import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequireAdmin } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
}));

vi.mock("@/lib/api/helpers", () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }));

vi.mock("@repo/database", () => ({
  db: { select: mockSelect },
  schema: {
    users: {},
    sessions: {},
    subscriptions: {},
    trackedSubscriptions: {},
  },
}));

vi.mock("drizzle-orm", () => ({
  count: vi.fn(() => ({ as: vi.fn(() => "count") })),
  countDistinct: vi.fn(() => ({ as: vi.fn(() => "count") })),
  sql: new Proxy(
    {},
    {
      get:
        () =>
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (..._args: unknown[]) => ({ as: vi.fn(() => "sql_value") }),
    },
  ),
  and: vi.fn(),
  gte: vi.fn(),
  inArray: vi.fn(),
  eq: vi.fn(),
  isNotNull: vi.fn(),
}));

import { GET } from "@/app/api/admin/stats/route";

const fakeAdminSession = {
  user: { id: "admin-1", role: "admin" },
  session: {},
};

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ session: fakeAdminSession });
  });

  it("returns 401 for unauthenticated request", async () => {
    mockRequireAdmin.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await GET(new Request("http://localhost/api/admin/stats"));
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin user", async () => {
    mockRequireAdmin.mockResolvedValue({
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
    });
    const res = await GET(new Request("http://localhost/api/admin/stats"));
    expect(res.status).toBe(403);
  });

  it("returns admin stats shape for admin user", async () => {
    // Mock all select calls to return count objects
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 5 }]),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve([{ count: 5 }]).then(resolve),
    });

    const res = await GET(new Request("http://localhost/api/admin/stats"));
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body).toHaveProperty("totalUsers");
    expect(body).toHaveProperty("activeUsers30d");
    expect(body).toHaveProperty("proUsers");
    expect(body).toHaveProperty("freeUsers");
    expect(body).toHaveProperty("totalSubscriptions");
    expect(body).toHaveProperty("signups7d");
    expect(body).toHaveProperty("signups30d");
    expect(body).toHaveProperty("bannedUsers");
  });
});
