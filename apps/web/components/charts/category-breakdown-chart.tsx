"use client";

import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/chart";
import type { CategoryBreakdownItem } from "@/lib/types/api";

function buildConfig(items: CategoryBreakdownItem[]): ChartConfig {
  return Object.fromEntries(
    items.map((item) => [item.name, { label: item.name, color: item.color }]),
  );
}

interface Props {
  data: CategoryBreakdownItem[];
}

export function CategoryBreakdownChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No category data yet
      </div>
    );
  }

  const config = buildConfig(data);

  return (
    <div data-testid="category-breakdown-chart">
      <ChartContainer config={config} className="h-56 w-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                nameKey="name"
              />
            }
          />
          <Pie data={data} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="mt-2 space-y-1">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-muted-foreground">{item.name}</span>
            <span className="font-medium">${item.total.toFixed(2)}/mo</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
