import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createWrapper } from "@/tests/test-utils";
import TipsPage from "@/app/(dashboard)/tips/page";

// Mock subscription plan hook
const mockPlanData = vi.fn();
vi.mock("@/hooks/use-subscription-plan", () => ({
  useSubscriptionPlan: () => mockPlanData(),
}));

// Mock AI tips hook
const mockAiTipsData = vi.fn();
vi.mock("@/hooks/use-ai-tips", () => ({
  useAiTips: () => mockAiTipsData(),
}));

describe("Tips page", () => {
  it("shows loading skeleton while plan is loading", () => {
    mockPlanData.mockReturnValue({ data: undefined, isLoading: true });
    mockAiTipsData.mockReturnValue({ data: undefined, isLoading: true });
    render(<TipsPage />, { wrapper: createWrapper() });
    expect(document.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("shows upgrade prompt for free users", () => {
    mockPlanData.mockReturnValue({
      data: { plan: "free", status: null },
      isLoading: false,
    });
    mockAiTipsData.mockReturnValue({ data: undefined, isLoading: false });
    render(<TipsPage />, { wrapper: createWrapper() });
    expect(screen.getByText(/Pro feature/)).toBeInTheDocument();
    expect(screen.getByText(/View plans/)).toBeInTheDocument();
  });

  it("shows empty state for Pro user with no tips", () => {
    mockPlanData.mockReturnValue({
      data: { plan: "pro", status: "active" },
      isLoading: false,
    });
    mockAiTipsData.mockReturnValue({ data: [], isLoading: false });
    render(<TipsPage />, { wrapper: createWrapper() });
    expect(screen.getByText(/No tips yet/)).toBeInTheDocument();
  });

  it("renders AI tip cards for Pro user with tips", () => {
    mockPlanData.mockReturnValue({
      data: { plan: "pro", status: "active" },
      isLoading: false,
    });
    mockAiTipsData.mockReturnValue({
      data: [
        {
          id: 1,
          title: "Save on streaming",
          message: "Switch to annual",
          category: "savings",
          generatedAt: "2026-02-28T00:00:00Z",
          expiresAt: "2026-03-08T00:00:00Z",
        },
        {
          id: 2,
          title: "High spend alert",
          message: "Your software costs are rising",
          category: "warning",
          generatedAt: "2026-02-28T00:00:00Z",
          expiresAt: "2026-03-08T00:00:00Z",
        },
      ],
      isLoading: false,
    });
    render(<TipsPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Save on streaming")).toBeInTheDocument();
    expect(screen.getByText("High spend alert")).toBeInTheDocument();
  });

  it("shows 'Refreshed weekly' subtitle for Pro users", () => {
    mockPlanData.mockReturnValue({
      data: { plan: "pro", status: "active" },
      isLoading: false,
    });
    mockAiTipsData.mockReturnValue({ data: [], isLoading: false });
    render(<TipsPage />, { wrapper: createWrapper() });
    expect(screen.getByText(/Refreshed weekly/i)).toBeInTheDocument();
  });
});
