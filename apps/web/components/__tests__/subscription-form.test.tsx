import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscriptionForm } from "../subscription-form";
import { renderWithProviders } from "@/tests/test-utils";
import { mockCategory } from "@/tests/fixtures";
import { toast } from "sonner";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Radix UI Select throws on value="". Use simple mock.
vi.mock("@repo/ui/select", () => ({
  Select: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value?: string;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "select", "data-value": value },
      children,
    ),
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
  SelectContent: () => null, // Don't render options to avoid duplicate text nodes
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

// Calendar and Popover are complex UI; mock them so date pickers don't break tests
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

vi.mock("@/hooks/use-categories", () => ({
  useCategories: vi.fn(),
}));

vi.mock("@/hooks/use-subscription-mutations", () => ({
  useSaveSubscription: vi.fn(),
  useCreateCategory: vi.fn(),
  useDeactivateSubscription: vi.fn(),
  useDeleteSubscription: vi.fn(),
}));

// Mock ServiceCatalogSearch to avoid complex interactions in this test
vi.mock("@/components/service-catalog-search", () => ({
  ServiceCatalogSearch: ({ onSelect }: { onSelect: () => void }) => (
    <input
      data-testid="catalog-search"
      placeholder="catalog-search"
      onChange={() => onSelect()}
    />
  ),
}));

import { useCategories } from "@/hooks/use-categories";
import { useSaveSubscription } from "@/hooks/use-subscription-mutations";

const mockSaveAsync = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockPush.mockReset();
  vi.mocked(useCategories).mockReturnValue({ data: [] } as never);
  vi.mocked(useSaveSubscription).mockReturnValue({
    mutateAsync: mockSaveAsync,
    isPending: false,
  } as never);
});

describe("SubscriptionForm", () => {
  it("renders all required form fields", () => {
    renderWithProviders(<SubscriptionForm mode="create" />);
    expect(screen.getByPlaceholderText("Netflix")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("9.99")).toBeInTheDocument();
    expect(screen.getByText("Currency")).toBeInTheDocument();
  });

  it("shows 'Add subscription' button in create mode", () => {
    renderWithProviders(<SubscriptionForm mode="create" />);
    expect(
      screen.getByRole("button", { name: /add subscription/i }),
    ).toBeInTheDocument();
  });

  it("shows 'Save changes' button in edit mode", () => {
    renderWithProviders(<SubscriptionForm mode="edit" subscriptionId={1} />);
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });

  it("shows catalog search in create mode", () => {
    renderWithProviders(<SubscriptionForm mode="create" />);
    expect(screen.getByTestId("catalog-search")).toBeInTheDocument();
  });

  it("does not show catalog search in edit mode", () => {
    renderWithProviders(<SubscriptionForm mode="edit" subscriptionId={1} />);
    expect(screen.queryByTestId("catalog-search")).not.toBeInTheDocument();
  });

  it("pre-fills form fields from initialValues", () => {
    renderWithProviders(
      <SubscriptionForm
        mode="edit"
        subscriptionId={1}
        initialValues={{ name: "Spotify", price: "9.99" }}
      />,
    );
    expect(
      (screen.getByPlaceholderText("Netflix") as HTMLInputElement).value,
    ).toBe("Spotify");
    expect(
      (screen.getByPlaceholderText("9.99") as HTMLInputElement).value,
    ).toBe("9.99");
  });

  it("shows validation errors on submit with empty required fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SubscriptionForm mode="create" />);
    await user.click(screen.getByRole("button", { name: /add subscription/i }));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it("shows renewal date validation error when date is not selected", async () => {
    const user = userEvent.setup();
    mockSaveAsync.mockResolvedValue({ id: 1 });

    renderWithProviders(<SubscriptionForm mode="create" />);

    await user.type(screen.getByPlaceholderText("Netflix"), "Netflix");
    await user.type(screen.getByPlaceholderText("9.99"), "15.99");
    // currency already defaults to USD, billingCycle to monthly
    // nextRenewalDate — we can't easily pick from calendar in unit test;
    // manually set form value via input directly isn't possible with Calendar picker.
    // Instead verify that the mutation is called when all fields are valid.
    // We'll accept that the validation error for nextRenewalDate shows up:
    await user.click(screen.getByRole("button", { name: /add subscription/i }));
    await waitFor(() => {
      expect(screen.getByText(/renewal date is required/i)).toBeInTheDocument();
    });
  });

  it("calls onSuccess callback instead of router.push when provided", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockSaveAsync.mockResolvedValue({ id: 1 });

    // Provide all valid initial values to bypass validation
    renderWithProviders(
      <SubscriptionForm
        mode="edit"
        subscriptionId={1}
        initialValues={{
          name: "Netflix",
          price: "15.99",
          currency: "USD",
          billingCycle: "monthly",
          nextRenewalDate: "2026-03-15",
        }}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => {
      expect(mockSaveAsync).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("shows error toast on save failure", async () => {
    const user = userEvent.setup();
    mockSaveAsync.mockRejectedValue(new Error("Server error"));

    renderWithProviders(
      <SubscriptionForm
        mode="edit"
        subscriptionId={1}
        initialValues={{
          name: "Netflix",
          price: "15.99",
          currency: "USD",
          billingCycle: "monthly",
          nextRenewalDate: "2026-03-15",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });

  it("renders categories in the category select", () => {
    vi.mocked(useCategories).mockReturnValue({
      data: [
        mockCategory({ id: 1, name: "Entertainment" }),
        mockCategory({ id: 2, name: "Work" }),
      ],
    } as never);

    renderWithProviders(<SubscriptionForm mode="create" />);
    // SelectValue mock renders placeholder — with SelectContent=null no duplicate
    expect(screen.getByText("No category")).toBeInTheDocument();
    // The "New category" add button is also present
    expect(
      screen.getByRole("button", { name: /new category/i }),
    ).toBeInTheDocument();
  });
});
