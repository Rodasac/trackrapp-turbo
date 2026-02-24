import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscriptionList } from "../subscription-list";
import { renderWithProviders } from "@/tests/test-utils";
import { mockSubscriptionListItem, mockCategory } from "@/tests/fixtures";

// Radix UI Select throws on value="". Use a simple mock so tests can render.
vi.mock("@repo/ui/select", () => ({
  Select: ({ children, value }: { children: React.ReactNode; value?: string }) =>
    React.createElement("div", { "data-testid": "select", "data-value": value }, children),
  SelectGroup: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
  SelectValue: ({ placeholder }: { placeholder?: string }) => React.createElement("span", null, placeholder),
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    React.createElement("button", { type: "button", className }, children),
  SelectContent: () => null, // Don't render options to avoid duplicate text nodes
  SelectLabel: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement("div", { "data-value": value }, children),
  SelectSeparator: () => null,
  SelectScrollUpButton: () => null,
  SelectScrollDownButton: () => null,
}));

vi.mock("@/hooks/use-categories", () => ({
  useCategories: vi.fn(),
}));

vi.mock("@/hooks/use-subscriptions", () => ({
  useSubscriptions: vi.fn(),
}));

vi.mock("@/hooks/use-subscription-mutations", () => ({
  useDeactivateSubscription: vi.fn(),
  useDeleteSubscription: vi.fn(),
  useSaveSubscription: vi.fn(),
  useCreateCategory: vi.fn(),
}));

import { useCategories } from "@/hooks/use-categories";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useDeactivateSubscription } from "@/hooks/use-subscription-mutations";

const mockDeactivate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCategories).mockReturnValue({ data: [] } as never);
  vi.mocked(useDeactivateSubscription).mockReturnValue({
    mutateAsync: mockDeactivate,
    isPending: false,
  } as never);
});

describe("SubscriptionList", () => {
  it("shows skeleton rows while loading", () => {
    vi.mocked(useSubscriptions).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionList />);
    // Skeleton rows contain animated divs — verify the table is rendered
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders subscription rows with name and price", () => {
    vi.mocked(useSubscriptions).mockReturnValue({
      data: [
        mockSubscriptionListItem({ id: 1, name: "Netflix", price: "15.99" }),
        mockSubscriptionListItem({ id: 2, name: "Spotify", price: "9.99" }),
      ],
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionList />);
    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Spotify")).toBeInTheDocument();
    expect(screen.getByText("$15.99")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
  });

  it("renders category badge for subscription with category", () => {
    vi.mocked(useSubscriptions).mockReturnValue({
      data: [
        mockSubscriptionListItem({
          // Use null icon to avoid "tv Entertainment" prefix making exact match fail
          category: mockCategory({ name: "Entertainment", icon: null }),
        }),
      ],
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionList />);
    expect(screen.getByText("Entertainment")).toBeInTheDocument();
  });

  it("shows 'No subscriptions yet' empty state with no filters", () => {
    vi.mocked(useSubscriptions).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionList />);
    expect(screen.getByText(/no subscriptions yet/i)).toBeInTheDocument();
  });

  it("shows 'No matches' empty state when search is active", async () => {
    const user = userEvent.setup();
    vi.mocked(useSubscriptions).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionList />);
    await user.type(
      screen.getByPlaceholderText(/search subscriptions/i),
      "xyz",
    );
    expect(screen.getByText(/no matches/i)).toBeInTheDocument();
  });

  it("renders search input, category filter, and sort select", () => {
    vi.mocked(useSubscriptions).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionList />);
    expect(
      screen.getByPlaceholderText(/search subscriptions/i),
    ).toBeInTheDocument();
    // SelectValue renders placeholder via mock
    expect(screen.getByText("All categories")).toBeInTheDocument();
    // Sort select shows Renewal placeholder
    expect(screen.getByText(/renewal/i)).toBeInTheDocument();
  });

  it("shows initial letter fallback when no logo or website", () => {
    vi.mocked(useSubscriptions).mockReturnValue({
      data: [
        mockSubscriptionListItem({
          name: "Netflix",
          logoUrl: null,
          websiteUrl: null,
        }),
      ],
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionList />);
    // The initial letter avatar shows the first char of the name
    expect(screen.getByText("N")).toBeInTheDocument();
  });

  it("renders inactive badge for inactive subscription", () => {
    vi.mocked(useSubscriptions).mockReturnValue({
      data: [mockSubscriptionListItem({ isActive: false })],
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionList />);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });
});
