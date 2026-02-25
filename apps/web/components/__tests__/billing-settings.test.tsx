import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BillingSettings } from "../billing-settings";
import { renderWithProviders } from "@/tests/test-utils";
import {
  mockSubscriptionPlan,
  mockProPlan,
  mockTrialingPlan,
} from "@/tests/fixtures";
import { toast } from "sonner";

vi.mock("@/hooks/use-subscription-plan", () => ({
  useSubscriptionPlan: vi.fn(),
}));
vi.mock("@/hooks/use-subscription-plan-mutations", () => ({
  useUpgradeToPro: vi.fn(),
  useOpenBillingPortal: vi.fn(),
}));

import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import {
  useUpgradeToPro,
  useOpenBillingPortal,
} from "@/hooks/use-subscription-plan-mutations";

const mockUpgradeMutateAsync = vi.fn();
const mockBillingPortalMutateAsync = vi.fn();

function setupMocks(planOverrides?: ReturnType<typeof mockSubscriptionPlan>) {
  vi.mocked(useSubscriptionPlan).mockReturnValue({
    data: planOverrides ?? mockSubscriptionPlan(),
    isLoading: false,
  } as never);
  vi.mocked(useUpgradeToPro).mockReturnValue({
    mutateAsync: mockUpgradeMutateAsync,
    isPending: false,
  } as never);
  vi.mocked(useOpenBillingPortal).mockReturnValue({
    mutateAsync: mockBillingPortalMutateAsync,
    isPending: false,
  } as never);
}

describe("BillingSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpgradeMutateAsync.mockResolvedValue({});
    mockBillingPortalMutateAsync.mockResolvedValue({});
    setupMocks();
  });

  it("shows loading skeleton when isLoading is true", () => {
    vi.mocked(useSubscriptionPlan).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);
    const { container } = renderWithProviders(<BillingSettings />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("shows Free plan label for free plan", () => {
    setupMocks(mockSubscriptionPlan());
    renderWithProviders(<BillingSettings />);
    expect(screen.getByText(/free plan/i)).toBeInTheDocument();
  });

  it("shows upgrade button for free plan", () => {
    setupMocks(mockSubscriptionPlan());
    renderWithProviders(<BillingSettings />);
    expect(
      screen.getByRole("button", { name: /upgrade to pro/i }),
    ).toBeInTheDocument();
  });

  it("shows Active badge and manage billing button for active pro plan", () => {
    setupMocks(mockProPlan());
    renderWithProviders(<BillingSettings />);
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /manage billing/i }),
    ).toBeInTheDocument();
  });

  it("shows Trial badge and trial end date for trialing plan", () => {
    setupMocks(mockTrialingPlan({ trialEnd: "2026-03-10T00:00:00.000Z" }));
    renderWithProviders(<BillingSettings />);
    // Badge text
    expect(screen.getAllByText(/trial/i)[0]).toBeInTheDocument();
    // Should show trial end date somewhere
    expect(screen.getByText(/mar 10, 2026/i)).toBeInTheDocument();
  });

  it("shows cancel warning for plan with cancelAtPeriodEnd=true", () => {
    setupMocks(
      mockProPlan({
        cancelAtPeriodEnd: true,
        periodEnd: "2026-03-25T00:00:00.000Z",
      }),
    );
    renderWithProviders(<BillingSettings />);
    expect(screen.getByText(/cancels/i)).toBeInTheDocument();
    expect(screen.getByText(/mar 25, 2026/i)).toBeInTheDocument();
  });

  it("calls upgrade mutation on upgrade button click", async () => {
    setupMocks(mockSubscriptionPlan());
    const user = userEvent.setup();
    renderWithProviders(<BillingSettings />);

    await user.click(screen.getByRole("button", { name: /upgrade to pro/i }));

    await waitFor(() => {
      expect(mockUpgradeMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ annual: false }),
      );
    });
  });

  it("calls billing portal mutation on manage billing click", async () => {
    setupMocks(mockProPlan());
    const user = userEvent.setup();
    renderWithProviders(<BillingSettings />);

    await user.click(screen.getByRole("button", { name: /manage billing/i }));

    await waitFor(() => {
      expect(mockBillingPortalMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ returnUrl: expect.any(String) }),
      );
    });
  });

  it("shows error toast when upgrade fails", async () => {
    mockUpgradeMutateAsync.mockRejectedValue(new Error("Card declined"));
    setupMocks(mockSubscriptionPlan());
    const user = userEvent.setup();
    renderWithProviders(<BillingSettings />);

    await user.click(screen.getByRole("button", { name: /upgrade to pro/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Card declined"),
      );
    });
  });

  it("shows error toast when billing portal fails", async () => {
    mockBillingPortalMutateAsync.mockRejectedValue(
      new Error("Portal unavailable"),
    );
    setupMocks(mockProPlan());
    const user = userEvent.setup();
    renderWithProviders(<BillingSettings />);

    await user.click(screen.getByRole("button", { name: /manage billing/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Portal unavailable"),
      );
    });
  });
});
