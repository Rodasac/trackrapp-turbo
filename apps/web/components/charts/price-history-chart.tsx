"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/chart";
import { formatPrice } from "@repo/shared/format";
import type { PriceHistoryItem } from "@/lib/types/api";

const chartConfig = {
  price: {
    label: "Price",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface Props {
  data: PriceHistoryItem[];
  currency: string;
}

export function PriceHistoryChart({ data, currency }: Props) {
  // Only render as a chart with 2+ data points
  if (data.length < 2) return null;

  const chartData = [...data]
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    )
    .map((ph) => ({
      date: new Date(ph.recordedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      price: parseFloat(ph.price),
    }));

  return (
    <ChartContainer
      config={chartConfig}
      className="h-48 w-full"
      data-testid="price-history-chart"
    >
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v: number) => formatPrice(String(v), currency)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [
                formatPrice(String(value), currency),
                "Price",
              ]}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="var(--color-price)"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
