import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRenewalCalendar } from "../use-renewal-calendar";
import { createWrapper } from "@/tests/test-utils";

const mockRenewals = [
  {
    id: 1,
    name: "Netflix",
    price: "15.99",
    currency: "USD",
    billingCycle: "monthly",
    nextRenewalDate: "2026-03-05",
    logoUrl: null,
  },
  {
    id: 2,
    name: "Spotify",
    price: "9.99",
    currency: "USD",
    billingCycle: "monthly",
    nextRenewalDate: "2026-03-10",
    logoUrl: null,
  },
];

describe("useRenewalCalendar", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches from /api/dashboard/renewals", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockRenewals), { status: 200 }),
    );

    const { result } = renderHook(() => useRenewalCalendar(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith("/api/dashboard/renewals");
  });

  it("returns an array of renewal items", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockRenewals), { status: 200 }),
    );

    const { result } = renderHook(() => useRenewalCalendar(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toHaveProperty("nextRenewalDate");
    expect(result.current.data?.[0]).toHaveProperty("name");
    expect(result.current.data?.[0]).toHaveProperty("price");
  });

  it("sets error on failure", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const { result } = renderHook(() => useRenewalCalendar(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
