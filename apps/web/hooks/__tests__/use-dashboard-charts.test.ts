import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardCharts } from "../use-dashboard-charts";
import { createWrapper } from "@/tests/test-utils";

const mockChartsData = {
  spendingTrend: [
    { month: "Jan '25", total: 45.97 },
    { month: "Feb '25", total: 50.0 },
  ],
  categoryBreakdown: [
    { name: "Entertainment", total: 30.0, color: "#6366f1" },
    { name: "Productivity", total: 15.97, color: "#22c55e" },
  ],
  topSubscriptions: [
    { name: "Netflix", monthlyRate: 15.99, billingCycle: "monthly" },
    { name: "Spotify", monthlyRate: 9.99, billingCycle: "monthly" },
  ],
};

describe("useDashboardCharts", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches from /api/dashboard/charts", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockChartsData), { status: 200 }),
    );

    const { result } = renderHook(() => useDashboardCharts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith("/api/dashboard/charts");
  });

  it("returns spendingTrend, categoryBreakdown, and topSubscriptions", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockChartsData), { status: 200 }),
    );

    const { result } = renderHook(() => useDashboardCharts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveProperty("spendingTrend");
    expect(result.current.data).toHaveProperty("categoryBreakdown");
    expect(result.current.data).toHaveProperty("topSubscriptions");
    expect(result.current.data?.spendingTrend).toHaveLength(2);
    expect(result.current.data?.categoryBreakdown[0]?.name).toBe("Entertainment");
    expect(result.current.data?.topSubscriptions[0]?.name).toBe("Netflix");
  });

  it("sets error on failure", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const { result } = renderHook(() => useDashboardCharts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
