import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PricingPage from "@/app/pricing/page";
import { renderWithProviders } from "@/tests/test-utils";
import { mockProPlan, mockSubscriptionPlan } from "@/tests/fixtures";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    subscription: {
      upgrade: vi.fn(),
      billingPortal: vi.fn(),
    },
  },
  useSession: vi.fn(),
}));
vi.mock("@/hooks/use-subscription-plan", () => ({
  useSubscriptionPlan: vi.fn(),
  useIsPro: vi.fn(),
}));
vi.mock("@/hooks/use-subscription-plan-mutations", () => ({
  useUpgradeToPro: vi.fn(),
}));

import { useSession } from "@/lib/auth-client";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { useUpgradeToPro } from "@/hooks/use-subscription-plan-mutations";

const mockUpgradeMutateAsync = vi.fn();

function setupLoggedOut() {
  vi.mocked(useSession).mockReturnValue({ data: null } as never);
  vi.mocked(useSubscriptionPlan).mockReturnValue({
    data: undefined,
  } as never);
  vi.mocked(useUpgradeToPro).mockReturnValue({
    mutateAsync: mockUpgradeMutateAsync,
    isPending: false,
  } as never);
}

function setupLoggedInFree() {
  vi.mocked(useSession).mockReturnValue({
    data: { user: { id: "user-1" }, session: {} },
  } as never);
  vi.mocked(useSubscriptionPlan).mockReturnValue({
    data: mockSubscriptionPlan(),
    isLoading: false,
  } as never);
  vi.mocked(useUpgradeToPro).mockReturnValue({
    mutateAsync: mockUpgradeMutateAsync,
    isPending: false,
  } as never);
}

function setupLoggedInPro() {
  vi.mocked(useSession).mockReturnValue({
    data: { user: { id: "user-1" }, session: {} },
  } as never);
  vi.mocked(useSubscriptionPlan).mockReturnValue({
    data: mockProPlan(),
    isLoading: false,
  } as never);
  vi.mocked(useUpgradeToPro).mockReturnValue({
    mutateAsync: mockUpgradeMutateAsync,
    isPending: false,
  } as never);
}

describe("PricingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpgradeMutateAsync.mockResolvedValue({});
    setupLoggedOut();
  });

  it("renders both Free and Pro plan cards", () => {
    renderWithProviders(<PricingPage />);
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("shows monthly price $4/month by default", () => {
    renderWithProviders(<PricingPage />);
    expect(screen.getByText("$4")).toBeInTheDocument();
    expect(screen.getAllByText("/ month")[0]).toBeInTheDocument();
  });

  it("shows annual price $40/year when annual toggle is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PricingPage />);

    await user.click(screen.getByRole("button", { name: /annual/i }));

    await waitFor(() => {
      expect(screen.getByText("$40")).toBeInTheDocument();
    });
    expect(screen.getByText(/year/i)).toBeInTheDocument();
  });

  it("shows Save 17% badge when annual is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PricingPage />);

    await user.click(screen.getByRole("button", { name: /annual/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/save 17%/i)[0]).toBeInTheDocument();
    });
  });

  it("does NOT show 'no credit card required' text", () => {
    renderWithProviders(<PricingPage />);
    expect(
      screen.queryByText(/no credit card required/i),
    ).not.toBeInTheDocument();
  });

  it("shows 'Get started free' link to /signup when logged out", () => {
    setupLoggedOut();
    renderWithProviders(<PricingPage />);
    const link = screen.getByRole("link", { name: /get started free/i });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("shows 'Start free trial' button linked to /signup?plan=pro when logged out", () => {
    setupLoggedOut();
    renderWithProviders(<PricingPage />);
    const link = screen.getByRole("link", { name: /start free trial/i });
    expect(link).toHaveAttribute("href", "/signup?plan=pro");
  });

  it("triggers upgrade mutation when logged in + free and clicks Start free trial", async () => {
    setupLoggedInFree();
    const user = userEvent.setup();
    renderWithProviders(<PricingPage />);

    await user.click(screen.getByRole("button", { name: /start free trial/i }));

    await waitFor(() => {
      expect(mockUpgradeMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ annual: false }),
      );
    });
  });

  it("shows 'Current plan' disabled button for pro users", () => {
    setupLoggedInPro();
    renderWithProviders(<PricingPage />);
    const btn = screen.getByRole("button", { name: /current plan/i });
    expect(btn).toBeDisabled();
  });
});
