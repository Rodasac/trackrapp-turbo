import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { TopSubscriptionsChart } from "../top-subscriptions-chart";

vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => null,
}));

vi.mock("@repo/ui/chart", () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}));

const topSubsData = [
  { name: "Netflix", monthlyRate: 15.99, billingCycle: "monthly" },
  { name: "Spotify", monthlyRate: 9.99, billingCycle: "monthly" },
];

describe("TopSubscriptionsChart", () => {
  it("renders chart container when data is present", () => {
    renderWithProviders(<TopSubscriptionsChart data={topSubsData} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("shows empty state when data is empty", () => {
    renderWithProviders(<TopSubscriptionsChart data={[]} />);
    expect(screen.getByText("No subscriptions yet")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });
});
