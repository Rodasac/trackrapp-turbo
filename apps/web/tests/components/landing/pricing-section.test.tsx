import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingSection } from "@/components/landing/pricing-section";
import { renderWithProviders } from "@/tests/test-utils";

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

beforeEach(() => {
  vi.clearAllMocks();
  mockUpgradeMutateAsync.mockResolvedValue({});
  setupLoggedOut();
});

describe("PricingSection", () => {
  it("renders section heading", () => {
    renderWithProviders(<PricingSection />);
    expect(
      screen.getByRole("heading", { name: /simple pricing/i }),
    ).toBeInTheDocument();
  });

  it("renders Free and Pro plan cards", () => {
    renderWithProviders(<PricingSection />);
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("monthly/annual toggle changes price display", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PricingSection />);

    await user.click(screen.getByRole("button", { name: /annual/i }));

    await waitFor(() => {
      expect(screen.getByText("$40")).toBeInTheDocument();
    });
  });

  it("shows Save 17% badge when annual is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PricingSection />);

    await user.click(screen.getByRole("button", { name: /annual/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/save 17%/i)[0]).toBeInTheDocument();
    });
  });

  it("Pro card shows Most popular badge", () => {
    renderWithProviders(<PricingSection />);
    expect(screen.getByText(/most popular/i)).toBeInTheDocument();
  });

  it("unauthenticated CTAs link to /signup", () => {
    setupLoggedOut();
    renderWithProviders(<PricingSection />);
    const trialLink = screen.getByRole("link", { name: /start free trial/i });
    expect(trialLink).toHaveAttribute("href", "/signup");
  });
});
