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
  useRenewSubscription: vi.fn(),
  useUndoRenewal: vi.fn(),
  useReactivateSubscription: vi.fn(),
}));

vi.mock("@/hooks/use-user-preferences", () => ({
  useUserPreferences: vi.fn(),
}));

vi.mock("@repo/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
    id,
  }: {
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
    id?: string;
  }) =>
    React.createElement("button", {
      role: "switch",
      "aria-checked": checked,
      id,
      onClick: () => onCheckedChange(!checked),
    }),
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
  useRenewSubscription,
  useUndoRenewal,
  useReactivateSubscription,
} from "@/hooks/use-subscription-mutations";
import { useUserPreferences } from "@/hooks/use-user-preferences";

const pendingMutation = {
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCategories).mockReturnValue({ data: [] } as never);
  vi.mocked(useSaveSubscription).mockReturnValue({
    ...pendingMutation,
  } as never);
  vi.mocked(useCreateCategory).mockReturnValue({ ...pendingMutation } as never);
  vi.mocked(useDeactivateSubscription).mockReturnValue({
    ...pendingMutation,
  } as never);
  vi.mocked(useDeleteSubscription).mockReturnValue({
    ...pendingMutation,
  } as never);
  vi.mocked(useRenewSubscription).mockReturnValue({
    ...pendingMutation,
  } as never);
  vi.mocked(useUndoRenewal).mockReturnValue({ ...pendingMutation } as never);
  vi.mocked(useReactivateSubscription).mockReturnValue({
    ...pendingMutation,
  } as never);
  vi.mocked(useUserPreferences).mockReturnValue({
    data: { autoRenewDefault: true },
    isLoading: false,
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

  it("renders the delete dialog trigger for inactive subscriptions", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({ isActive: false }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("shows Cancel button for active subscriptions (not Delete)", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({ isActive: true }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });

  it("shows Renew button when subscription is due and active", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({
        isActive: true,
        nextRenewalDate: "2025-01-01", // past date → due
        previousRenewalDate: null,
      }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.getByRole("button", { name: /renew/i })).toBeInTheDocument();
  });

  it("shows Undo Renewal button when previousRenewalDate is set", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({
        isActive: true,
        nextRenewalDate: "2026-04-01",
        previousRenewalDate: "2026-03-01",
      }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(
      screen.getByRole("button", { name: /undo renewal/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^renew$/i }),
    ).not.toBeInTheDocument();
  });

  it("shows Reactivate button for inactive subscriptions", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({ isActive: false }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(
      screen.getByRole("button", { name: /reactivate/i }),
    ).toBeInTheDocument();
  });

  it("shows Due badge when renewal date is past and subscription is active", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({
        isActive: true,
        nextRenewalDate: "2025-01-01",
      }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    expect(screen.getByText("Due")).toBeInTheDocument();
  });

  it("shows auto-renew switch using global default when autoRenew is null", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({ autoRenew: null }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "true"); // default is true
    expect(screen.getByText("(using default)")).toBeInTheDocument();
  });

  it("shows auto-renew switch with explicit value when set", () => {
    vi.mocked(useSubscription).mockReturnValue({
      data: mockSubscriptionDetail({ autoRenew: false }),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<SubscriptionDetail id={1} />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });
});
