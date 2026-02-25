import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import TipsPage from "@/app/(dashboard)/tips/page";
import { renderWithProviders } from "@/tests/test-utils";
import { mockSubscriptionPlan, mockProPlan } from "@/tests/fixtures";

vi.mock("@/hooks/use-subscription-plan", () => ({
  useSubscriptionPlan: vi.fn(),
  useIsPro: vi.fn(),
}));

import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";

describe("TipsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton while plan is loading", () => {
    vi.mocked(useSubscriptionPlan).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);
    const { container } = renderWithProviders(<TipsPage />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("shows upgrade prompt for free plan users", () => {
    vi.mocked(useSubscriptionPlan).mockReturnValue({
      data: mockSubscriptionPlan(),
      isLoading: false,
    } as never);
    renderWithProviders(<TipsPage />);
    expect(
      screen.getByRole("link", { name: /upgrade to pro/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/ai tips are a pro feature/i)).toBeInTheDocument();
  });

  it("shows 'No tips yet' placeholder for pro plan users", () => {
    vi.mocked(useSubscriptionPlan).mockReturnValue({
      data: mockProPlan(),
      isLoading: false,
    } as never);
    renderWithProviders(<TipsPage />);
    expect(screen.getByText(/no tips yet/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /upgrade to pro/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the Pro badge in the header", () => {
    vi.mocked(useSubscriptionPlan).mockReturnValue({
      data: mockSubscriptionPlan(),
      isLoading: false,
    } as never);
    renderWithProviders(<TipsPage />);
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });
});
