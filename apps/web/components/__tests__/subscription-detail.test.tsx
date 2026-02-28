import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscriptionDetail } from "../subscription-detail";
import { renderWithProviders } from "@/tests/test-utils";
import { mockSubscriptionDetail, mockCategory } from "@/tests/fixtures";

// Radix UI Select throws on value="". Mock for edit mode rendering.
vi.mock("@repo/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "select" }, children),
  SelectGroup: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  SelectValue: ({ placeholder }: { placeholder?: string }) =>
    React.createElement("span", null, placeholder),
  SelectTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => React.createElement("button", { type: "button", className }, children),
  SelectContent: () => null,
  SelectLabel: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => React.createElement("div", { "data-value": value }, children),
  SelectSeparator: () => null,
  SelectScrollUpButton: () => null,
  SelectScrollDownButton: () => null,
}));

vi.mock("@repo/ui/calendar", () => ({
  Calendar: () => React.createElement("div", { "data-testid": "calendar" }),
}));

vi.mock("@repo/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  PopoverContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/hooks/use-subscription", () => ({
  useSubscription: vi.fn(),
}));

vi.mock("@/hooks/use-categories", () => ({
  useCategories: vi.fn(),
}));

vi.mock("@/hooks/use-subscription-mutations", () => ({
  useSaveSubscription: vi.fn(),
  useCreateCategory: vi.fn(),
  useDeactivateSubscription: vi.fn(),
  useDeleteSubscription: vi.fn(),
}));

vi.mock("@/components/service-catalog-search", () => ({
  ServiceCatalogSearch: () => null,
}));

vi.mock("@/components/charts/price-history-chart", () => ({
  PriceHistoryChart: ({ data }: { data: { price: string }[] }) => (
    <div data-testid="price-history-chart">
      {data.map((ph, i) => (
        <span key={i}>${ph.price}</span>
      ))}
    </div>
  ),
}));

import { useSubscription } from "@/hooks/use-subscription";
import { useCategories } from "@/hooks/use-categories";
import {
  useSaveSubscription,
  useCreateCategory,
  useDeactivateSubscription,
  useDeleteSubscription,
} from "@/hooks/use-subscription-mutations";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCategories).mockReturnValue({ data: [] } as never);
  vi.mocked(useSaveSubscription).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
  vi.mocked(useCreateCategory).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
  vi.mocked(useDeactivateSubscription).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
  vi.mocked(useDeleteSubscription).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
});

describe("SubscriptionDetail", () => {
  it("shows loading skeletons while fetching", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    // Skeleton divs with animate-pulse class
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows not found message on error", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as never);

    renderWithProviders(<SubscriptionDetail id={99} />);
    expect(screen.getByText(/subscription not found/i)).toBeInTheDocument();
  });

  it("renders subscription name in view mode", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({ name: "Netflix" }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(
      screen.getByRole("heading", { name: "Netflix" }),
    ).toBeInTheDocument();
  });

  it("renders formatted price and billing cycle", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({
        price: "29.99", // unique price not in default priceHistory (15.99)
        currency: "USD",
        billingCycle: "monthly",
        priceHistory: [], // no history so price only appears once
      }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByText("/mo")).toBeInTheDocument();
  });

  it("renders category badge when present", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({
        // null icon avoids "tv Entertainment" prefix that breaks exact text match
        category: mockCategory({ name: "Entertainment", icon: null }),
      }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.getByText("Entertainment")).toBeInTheDocument();
  });

  it("renders price history entries", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({
        priceHistory: [
          { id: 1, price: "12.99", recordedAt: "2025-01-01" },
          { id: 2, price: "15.99", recordedAt: "2026-01-01" },
        ],
      }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.getByText("Price history")).toBeInTheDocument();
    expect(screen.getByText("$12.99")).toBeInTheDocument();
  });

  it("shows Edit button in view mode", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail(),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("switches to edit mode when Edit button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({ name: "Netflix" }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    await user.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /save changes/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
    });
  });

  it("returns to view mode when Cancel is clicked in edit mode", async () => {
    const user = userEvent.setup();
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({ name: "Netflix" }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Netflix" }),
      ).toBeInTheDocument();
    });
  });

  it("shows price history chart when 2+ price history entries", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({
        priceHistory: [
          { id: 1, price: "12.99", recordedAt: "2025-01-01" },
          { id: 2, price: "15.99", recordedAt: "2026-01-01" },
        ],
      }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.getByTestId("price-history-chart")).toBeInTheDocument();
  });

  it("shows flat list when only 1 price history entry", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({
        price: "15.99",
        priceHistory: [{ id: 1, price: "15.99", recordedAt: "2026-01-01" }],
      }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.queryByTestId("price-history-chart")).not.toBeInTheDocument();
    expect(screen.getByText("Price history")).toBeInTheDocument();
  });

  it("renders the delete dialog trigger", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail(),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });
});
