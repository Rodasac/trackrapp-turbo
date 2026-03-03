import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { DashboardCharts } from "../dashboard-charts";
import { renderWithProviders } from "@/tests/test-utils";

vi.mock("@/hooks/use-dashboard-charts", () => ({
  useDashboardCharts: vi.fn(),
}));

vi.mock("@/hooks/use-subscription-plan", () => ({
  useIsPro: vi.fn().mockReturnValue(true),
}));

// Stub chart sub-components to avoid recharts jsdom issues
vi.mock("../charts/spending-trend-chart", () => ({
  SpendingTrendChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="spending-trend-chart">trend-data:{data.length}</div>
  ),
}));
vi.mock("../charts/category-breakdown-chart", () => ({
  CategoryBreakdownChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="category-breakdown-chart">categories:{data.length}</div>
  ),
}));
vi.mock("../charts/top-subscriptions-chart", () => ({
  TopSubscriptionsChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="top-subscriptions-chart">top:{data.length}</div>
  ),
}));

import { useDashboardCharts } from "@/hooks/use-dashboard-charts";
import { useIsPro } from "@/hooks/use-subscription-plan";

const mockUseDashboardCharts = vi.mocked(useDashboardCharts);
const mockUseIsPro = vi.mocked(useIsPro);

describe("DashboardCharts", () => {
  it("shows upgrade prompt for free users", () => {
    mockUseIsPro.mockReturnValue(false);
    mockUseDashboardCharts.mockReturnValue({
      isLoading: false,
      data: undefined,
    } as never);
    renderWithProviders(<DashboardCharts />);
    expect(screen.getByText(/spending analytics/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view plans/i })).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-charts")).toBeNull();
  });

  it("shows loading skeleton while fetching (Pro user)", () => {
    mockUseIsPro.mockReturnValue(true);
    mockUseDashboardCharts.mockReturnValue({
      isLoading: true,
      data: undefined,
    } as never);
    renderWithProviders(<DashboardCharts />);
    expect(screen.getByTestId("dashboard-charts-loading")).toBeInTheDocument();
  });

  it("renders all three chart sections when data is available", () => {
    mockUseDashboardCharts.mockReturnValue({
      isLoading: false,
      data: {
        spendingTrend: [{ month: "Jan '25", total: 45.97 }],
        categoryBreakdown: [
          { name: "Entertainment", total: 30.0, color: "#6366f1" },
        ],
        topSubscriptions: [
          { name: "Netflix", monthlyRate: 15.99, billingCycle: "monthly" },
        ],
      },
    } as never);

    renderWithProviders(<DashboardCharts />);

    expect(screen.getByTestId("dashboard-charts")).toBeInTheDocument();
    expect(screen.getByTestId("spending-trend-chart")).toBeInTheDocument();
    expect(screen.getByTestId("category-breakdown-chart")).toBeInTheDocument();
    expect(screen.getByTestId("top-subscriptions-chart")).toBeInTheDocument();
    expect(screen.getByText("Spending trend")).toBeInTheDocument();
    expect(screen.getByText("By category")).toBeInTheDocument();
    expect(screen.getByText("Top subscriptions")).toBeInTheDocument();
  });

  it("passes empty arrays to charts when data is undefined", () => {
    mockUseDashboardCharts.mockReturnValue({
      isLoading: false,
      data: undefined,
    } as never);
    renderWithProviders(<DashboardCharts />);
    expect(screen.getByText("trend-data:0")).toBeInTheDocument();
    expect(screen.getByText("categories:0")).toBeInTheDocument();
    expect(screen.getByText("top:0")).toBeInTheDocument();
  });
});
