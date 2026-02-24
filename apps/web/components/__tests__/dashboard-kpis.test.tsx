import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { DashboardKpis } from "../dashboard-kpis";
import { renderWithProviders } from "@/tests/test-utils";
import { mockDashboardStats } from "@/tests/fixtures";

vi.mock("@/hooks/use-dashboard-stats", () => ({
  useDashboardStats: vi.fn(),
}));

import { useDashboardStats } from "@/hooks/use-dashboard-stats";
const mockUseDashboardStats = vi.mocked(useDashboardStats);

describe("DashboardKpis", () => {
  it("shows placeholder dashes while loading", () => {
    mockUseDashboardStats.mockReturnValue({ data: undefined } as never);
    renderWithProviders(<DashboardKpis />);
    // All 4 KPI cards show "—" when no data
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(4);
  });

  it("shows formatted monthly spend when data is available", () => {
    mockUseDashboardStats.mockReturnValue({
      data: mockDashboardStats({ monthlySpend: "45.97" }),
    } as never);
    renderWithProviders(<DashboardKpis />);
    expect(screen.getByText("$45.97")).toBeInTheDocument();
  });

  it("shows formatted yearly spend", () => {
    mockUseDashboardStats.mockReturnValue({
      data: mockDashboardStats({ yearlySpend: "551.64" }),
    } as never);
    renderWithProviders(<DashboardKpis />);
    expect(screen.getByText("$551.64")).toBeInTheDocument();
  });

  it("shows active count and upcoming renewals as strings", () => {
    mockUseDashboardStats.mockReturnValue({
      data: mockDashboardStats({ activeCount: 7, upcomingRenewals: 3 }),
    } as never);
    renderWithProviders(<DashboardKpis />);
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
