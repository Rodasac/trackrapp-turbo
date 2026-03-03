import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @/lib/auth before importing the module under test
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }));

vi.mock("@repo/database", () => ({
  db: { select: mockSelect },
  schema: { subscriptions: {} },
}));

import {
  requireSession,
  validationErrorResponse,
  parseIdParam,
  requireProSubscription,
  requireAdmin,
} from "../helpers";
import { auth } from "@/lib/auth";
import { z } from "zod";

const mockGetSession = vi.mocked(auth.api.getSession);

describe("requireSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns { session } when auth succeeds", async () => {
    const fakeSession = { id: "session-1", userId: "user-1" };
    mockGetSession.mockResolvedValue(fakeSession as never);

    const request = new Request("http://localhost/api/test");
    const result = await requireSession(request);

    expect("session" in result).toBe(true);
    if ("session" in result) {
      expect(result.session).toBe(fakeSession);
    }
  });

  it("returns { error: 401 Response } when session is null", async () => {
    mockGetSession.mockResolvedValue(null as never);

    const request = new Request("http://localhost/api/test");
    const result = await requireSession(request);

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(401);
    }
  });

  it("passes request headers to auth.api.getSession", async () => {
    mockGetSession.mockResolvedValue(null as never);

    const request = new Request("http://localhost/api/test", {
      headers: { Authorization: "Bearer token" },
    });
    await requireSession(request);

    expect(mockGetSession).toHaveBeenCalledWith({
      headers: request.headers,
    });
  });
});

describe("validationErrorResponse", () => {
  it("returns a 400 response", () => {
    const schema = z.object({ name: z.string().min(1) });
    const result = schema.safeParse({ name: "" });
    if (!result.success) {
      const response = validationErrorResponse(result.error);
      expect(response.status).toBe(400);
    }
  });

  it("body contains error and issues array", async () => {
    const schema = z.object({ name: z.string().min(1) });
    const result = schema.safeParse({ name: "" });
    if (!result.success) {
      const response = validationErrorResponse(result.error);
      const body = await response.json();
      expect(body).toHaveProperty("error");
      expect(Array.isArray(body.issues)).toBe(true);
      expect(body.issues.length).toBeGreaterThan(0);
    }
  });
});

describe("parseIdParam", () => {
  it("parses a valid numeric string", () => {
    const result = parseIdParam("42");
    expect("idNum" in result).toBe(true);
    if ("idNum" in result) {
      expect(result.idNum).toBe(42);
    }
  });

  it("returns 400 error for non-numeric string", () => {
    const result = parseIdParam("abc");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(400);
    }
  });

  it("returns 400 error for empty string", () => {
    const result = parseIdParam("");
    expect("error" in result).toBe(true);
  });

  it("returns 400 error for '0' (IDs must be positive)", () => {
    const result = parseIdParam("0");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(400);
    }
  });

  it("returns 400 error for negative numbers", () => {
    const result = parseIdParam("-1");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.status).toBe(400);
    }
  });
});

// ─── requireProSubscription ────────────────────────────────────────────────────

function makeProSelectChain(rows: unknown[]) {
  const mockWhere = vi.fn().mockResolvedValue(rows);
  mockSelect.mockReturnValue({
    from: vi.fn().mockReturnValue({ where: mockWhere }),
  });
  return mockWhere;
}

describe("requireProSubscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns { isPro: true } for active subscription", async () => {
    makeProSelectChain([{ id: "sub-1", status: "active" }]);
    const result = await requireProSubscription("user-1");
    expect("isPro" in result).toBe(true);
    if ("isPro" in result) expect(result.isPro).toBe(true);
  });

  it("returns { isPro: true } for trialing subscription", async () => {
    makeProSelectChain([{ id: "sub-2", status: "trialing" }]);
    const result = await requireProSubscription("user-1");
    expect("isPro" in result).toBe(true);
  });

  it("returns 403 when no subscription exists", async () => {
    makeProSelectChain([]);
    const result = await requireProSubscription("user-1");
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error.status).toBe(403);
  });

  it("returns 403 for canceled subscription (not in active/trialing)", async () => {
    // The query filters to active/trialing, so canceled returns empty array
    makeProSelectChain([]);
    const result = await requireProSubscription("user-1");
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error.status).toBe(403);
  });
});

// ─── requireAdmin ──────────────────────────────────────────────────────────────

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null as never);
    const request = new Request("http://localhost/api/admin/stats");
    const result = await requireAdmin(request);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error.status).toBe(401);
  });

  it("returns 403 when user role is 'user'", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", role: "user" },
      session: {},
    } as never);
    const request = new Request("http://localhost/api/admin/stats");
    const result = await requireAdmin(request);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error.status).toBe(403);
  });

  it("returns 403 when user has no role", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1" },
      session: {},
    } as never);
    const request = new Request("http://localhost/api/admin/stats");
    const result = await requireAdmin(request);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error.status).toBe(403);
  });

  it("returns { session } when user role is 'admin'", async () => {
    const fakeSession = { user: { id: "user-1", role: "admin" }, session: {} };
    mockGetSession.mockResolvedValue(fakeSession as never);
    const request = new Request("http://localhost/api/admin/stats");
    const result = await requireAdmin(request);
    expect("session" in result).toBe(true);
    if ("session" in result) {
      expect(result.session).toBe(fakeSession);
    }
  });
});
