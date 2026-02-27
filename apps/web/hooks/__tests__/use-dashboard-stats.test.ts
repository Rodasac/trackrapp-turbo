import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardStats } from "../use-dashboard-stats";
import { createWrapper } from "@/tests/test-utils";
import { mockDashboardStats } from "@/tests/fixtures";

describe("useDashboardStats", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches from /api/dashboard/stats", async () => {
    const stats = mockDashboardStats();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(stats), { status: 200 }),
    );

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith("/api/dashboard/stats");
  });

  it("returns stats object on success", async () => {
    const stats = mockDashboardStats({ activeCount: 5, upcomingRenewals: 2 });
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(stats), { status: 200 }),
    );

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(stats);
    expect(result.current.data).toHaveProperty("costPerDay");
    expect(result.current.data).toHaveProperty("remainingThisMonth");
  });

  it("sets error on failure", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
