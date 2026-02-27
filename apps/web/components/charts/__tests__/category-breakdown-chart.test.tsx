import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { CategoryBreakdownChart } from "../category-breakdown-chart";

vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => null,
  Cell: () => null,
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

const categoryData = [
  { name: "Entertainment", total: 30.0, color: "#6366f1" },
  { name: "Productivity", total: 15.97, color: "#22c55e" },
];

describe("CategoryBreakdownChart", () => {
  it("renders chart container and legend when data is present", () => {
    renderWithProviders(<CategoryBreakdownChart data={categoryData} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(screen.getByText("Entertainment")).toBeInTheDocument();
    expect(screen.getByText("Productivity")).toBeInTheDocument();
  });

  it("shows category totals in legend", () => {
    renderWithProviders(<CategoryBreakdownChart data={categoryData} />);
    expect(screen.getByText("$30.00/mo")).toBeInTheDocument();
    expect(screen.getByText("$15.97/mo")).toBeInTheDocument();
  });

  it("shows empty state when data is empty", () => {
    renderWithProviders(<CategoryBreakdownChart data={[]} />);
    expect(screen.getByText("No category data yet")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();
  });
});
