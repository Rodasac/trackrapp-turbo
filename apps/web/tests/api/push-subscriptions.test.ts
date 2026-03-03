import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequireSession, mockRequireProSubscription } = vi.hoisted(() => ({
  mockRequireSession: vi.fn(),
  mockRequireProSubscription: vi.fn(),
}));

vi.mock("@/lib/api/helpers", () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
  requireProSubscription: (...args: unknown[]) =>
    mockRequireProSubscription(...args),
  validationErrorResponse: (err: { issues: unknown[] }) =>
    Response.json({ error: "Validation failed", issues: err.issues }, { status: 400 }),
}));

const { mockFindFirst, mockInsert, mockDelete } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockInsert: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@repo/database", () => ({
  db: {
    query: {
      pushSubscriptions: { findFirst: mockFindFirst },
    },
    insert: mockInsert,
    delete: mockDelete,
  },
  schema: { pushSubscriptions: {} },
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn(),
  eq: vi.fn(),
}));

vi.mock("@repo/shared/validations", () => ({
  pushSubscriptionSchema: {
    safeParse: (body: unknown) => {
      const b = body as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      if (!b?.endpoint || !b?.keys?.p256dh || !b?.keys?.auth) {
        return { success: false, error: { issues: [{ message: "invalid" }] } };
      }
      return { success: true, data: b };
    },
  },
}));

import { POST, DELETE } from "@/app/api/push-subscriptions/route";

const fakeSession = { user: { id: "user-1" }, session: {} };
const validBody = {
  endpoint: "https://push.example.com/sub1",
  keys: { p256dh: "key123", auth: "auth456" },
};

describe("POST /api/push-subscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireSession.mockResolvedValue({ session: fakeSession });
    mockRequireProSubscription.mockResolvedValue({ isPro: true });
    mockFindFirst.mockResolvedValue(null);
    const chain = { values: vi.fn().mockReturnThis(), returning: vi.fn().mockResolvedValue([validBody]) };
    mockInsert.mockReturnValue(chain);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await POST(
      new Request("http://localhost/api/push-subscriptions", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-Pro user", async () => {
    mockRequireProSubscription.mockResolvedValue({
      error: Response.json(
        { error: "Pro subscription required" },
        { status: 403 },
      ),
    });
    const res = await POST(
      new Request("http://localhost/api/push-subscriptions", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    expect(res.status).toBe(403);
  });

  it("creates push subscription for Pro user", async () => {
    const res = await POST(
      new Request("http://localhost/api/push-subscriptions", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    expect(res.status).toBe(201);
  });

  it("returns existing subscription if already subscribed", async () => {
    mockFindFirst.mockResolvedValue(validBody);
    const res = await POST(
      new Request("http://localhost/api/push-subscriptions", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/push-subscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireSession.mockResolvedValue({ session: fakeSession });
    mockRequireProSubscription.mockResolvedValue({ isPro: true });
    const chain = { where: vi.fn().mockResolvedValue([]) };
    mockDelete.mockReturnValue(chain);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireSession.mockResolvedValue({
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const res = await DELETE(
      new Request(
        "http://localhost/api/push-subscriptions?endpoint=https://push.example.com/sub1",
      ),
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-Pro user", async () => {
    mockRequireProSubscription.mockResolvedValue({
      error: Response.json(
        { error: "Pro subscription required" },
        { status: 403 },
      ),
    });
    const res = await DELETE(
      new Request(
        "http://localhost/api/push-subscriptions?endpoint=https://push.example.com/sub1",
      ),
    );
    expect(res.status).toBe(403);
  });

  it("deletes subscription for Pro user", async () => {
    const res = await DELETE(
      new Request(
        "http://localhost/api/push-subscriptions?endpoint=https://push.example.com/sub1",
      ),
    );
    expect(res.status).toBe(200);
  });

  it("returns 400 when endpoint query param is missing", async () => {
    const res = await DELETE(
      new Request("http://localhost/api/push-subscriptions"),
    );
    expect(res.status).toBe(400);
  });
});
