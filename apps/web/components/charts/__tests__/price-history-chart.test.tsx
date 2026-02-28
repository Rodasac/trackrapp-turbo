import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { PriceHistoryChart } from "../price-history-chart";
import { mockPriceHistory } from "@/tests/fixtures";

vi.mock("recharts", () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => null,
}));

vi.mock("@repo/ui/chart", () => ({
  ChartContainer: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="price-history-chart" {...props}>
      {children}
    </div>
  ),
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}));

describe("PriceHistoryChart", () => {
  it("renders chart container when 2+ data points", () => {
    const data = [
      mockPriceHistory({
        id: 1,
        price: "9.99",
        recordedAt: "2025-01-01T00:00:00.000Z",
      }),
      mockPriceHistory({
        id: 2,
        price: "12.99",
        recordedAt: "2025-06-01T00:00:00.000Z",
      }),
    ];
    renderWithProviders(<PriceHistoryChart data={data} currency="USD" />);
    expect(screen.getByTestId("price-history-chart")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("returns null with only 1 data point", () => {
    const data = [mockPriceHistory({ id: 1, price: "9.99" })];
    const { container } = renderWithProviders(
      <PriceHistoryChart data={data} currency="USD" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null with 0 data points", () => {
    const { container } = renderWithProviders(
      <PriceHistoryChart data={[]} currency="USD" />,
    );
    expect(container.firstChild).toBeNull();
  });
});
