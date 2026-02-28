import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock("@repo/database", () => ({
  db: {
    select: vi.fn(),
    query: {
      categories: { findMany: vi.fn() },
    },
  },
  schema: {
    serviceCatalog: {},
    categories: {},
  },
}));

import { POST } from "@/app/api/subscriptions/import/preview/route";
import { auth } from "@/lib/auth";
import { db } from "@repo/database";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockSelect = vi.mocked(db.select);
const mockFindManyCategories = vi.mocked(db.query.categories.findMany);

const fakeSession = { user: { id: "user-1" }, session: {} };

const catalogRows = [
  {
    id: 1,
    name: "Netflix",
    logoUrl: "https://netflix.com/logo.png",
    websiteUrl: "https://netflix.com",
    defaultCategory: "Entertainment",
  },
  {
    id: 2,
    name: "Spotify",
    logoUrl: null,
    websiteUrl: "https://spotify.com",
    defaultCategory: "Music",
  },
];

const validRow = {
  name: "Netflix",
  price: "15.99",
  currency: "USD",
  billingCycle: "monthly",
  nextRenewalDate: "2026-03-15",
};

function makeSelectChain(returnValue: unknown) {
  const chain = {
    from: vi.fn().mockReturnThis(),
  };
  mockSelect.mockReturnValue(chain as never);
  // make the chain awaitable
  (chain as unknown as { then: unknown }).then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(returnValue).then(resolve);
  return chain;
}

describe("POST /api/subscriptions/import/preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue(fakeSession as never);
    makeSelectChain(catalogRows);
    mockFindManyCategories.mockResolvedValue([]);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null as never);
    const req = new Request("http://localhost/api/subscriptions/import/preview", {
      method: "POST",
      body: JSON.stringify({ rows: [validRow] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns preview rows with matched service", async () => {
    const req = new Request("http://localhost/api/subscriptions/import/preview", {
      method: "POST",
      body: JSON.stringify({ rows: [validRow] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.rows).toHaveLength(1);
    expect(body.rows[0].matchedService).not.toBeNull();
    expect(body.rows[0].matchedService.name).toBe("Netflix");
    expect(body.rows[0].matchConfidence).toBe("exact");
  });

  it("returns validation errors per row", async () => {
    const invalidRow = { name: "", price: "bad", billingCycle: "monthly", nextRenewalDate: "2026-03-15" };
    const req = new Request("http://localhost/api/subscriptions/import/preview", {
      method: "POST",
      body: JSON.stringify({ rows: [invalidRow] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.rows[0].isValid).toBe(false);
    expect(body.rows[0].errors.length).toBeGreaterThan(0);
  });

  it("returns fuzzy match confidence for close names", async () => {
    const req = new Request("http://localhost/api/subscriptions/import/preview", {
      method: "POST",
      body: JSON.stringify({ rows: [{ ...validRow, name: "Nettflix" }] }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.rows[0].matchConfidence).toBe("fuzzy");
  });

  it("resolves categoryName to categoryId from user categories", async () => {
    mockFindManyCategories.mockResolvedValue([
      { id: 5, name: "Entertainment", color: null, icon: null, userId: "user-1", createdAt: new Date() },
    ] as never);
    const req = new Request("http://localhost/api/subscriptions/import/preview", {
      method: "POST",
      body: JSON.stringify({ rows: [{ ...validRow, categoryName: "Entertainment" }] }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(body.rows[0].resolvedCategoryId).toBe(5);
  });
});
