import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/tests/test-utils";
import { StaticTipsList } from "../static-tips-list";

vi.mock("@/hooks/use-static-tips", () => ({
  useStaticTips: vi.fn(),
}));

import { useStaticTips } from "@/hooks/use-static-tips";
const mockUseStaticTips = vi.mocked(useStaticTips);

const mockTips = [
  {
    id: "annual-savings",
    title: "Switch to annual billing",
    message: "You could save $30/year by switching to annual.",
    type: "savings" as const,
  },
  {
    id: "daily-cost",
    title: "Your subscription cost per day",
    message: "You spend $1.50/day across all subscriptions.",
    type: "info" as const,
  },
  {
    id: "high-spend-entertainment",
    title: "High Entertainment spend",
    message: "Entertainment accounts for 60% of your monthly spend.",
    type: "warning" as const,
  },
];

describe("StaticTipsList", () => {
  it("shows loading skeleton while fetching", () => {
    mockUseStaticTips.mockReturnValue({ data: undefined, isLoading: true } as never);
    const { container } = renderWithProviders(<StaticTipsList />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows empty state when no tips", () => {
    mockUseStaticTips.mockReturnValue({ data: [], isLoading: false } as never);
    renderWithProviders(<StaticTipsList />);
    expect(screen.getByTestId("tips-empty")).toBeInTheDocument();
    expect(screen.getByText(/no insights yet/i)).toBeInTheDocument();
  });

  it("renders all tip titles when data is available", () => {
    mockUseStaticTips.mockReturnValue({ data: mockTips, isLoading: false } as never);
    renderWithProviders(<StaticTipsList />);
    expect(screen.getByTestId("tips-list")).toBeInTheDocument();
    expect(screen.getByText("Switch to annual billing")).toBeInTheDocument();
    expect(screen.getByText("Your subscription cost per day")).toBeInTheDocument();
    expect(screen.getByText("High Entertainment spend")).toBeInTheDocument();
  });

  it("renders tip messages", () => {
    mockUseStaticTips.mockReturnValue({ data: mockTips, isLoading: false } as never);
    renderWithProviders(<StaticTipsList />);
    expect(screen.getByText("You could save $30/year by switching to annual.")).toBeInTheDocument();
  });

  it("shows correct badges for each tip type", () => {
    mockUseStaticTips.mockReturnValue({ data: mockTips, isLoading: false } as never);
    renderWithProviders(<StaticTipsList />);
    expect(screen.getByText("Savings")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });
});
