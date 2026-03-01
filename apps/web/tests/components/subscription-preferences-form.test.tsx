import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscriptionPreferencesForm } from "@/components/subscription-preferences-form";
import { renderWithProviders } from "@/tests/test-utils";

vi.mock("@/hooks/use-user-preferences", () => ({
  useUserPreferences: vi.fn(),
  useUpdateUserPreferences: vi.fn(),
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

import {
  useUserPreferences,
  useUpdateUserPreferences,
} from "@/hooks/use-user-preferences";

const mockMutateAsync = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useUpdateUserPreferences).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as never);
});

describe("SubscriptionPreferencesForm", () => {
  it("shows loading skeleton while fetching", () => {
    vi.mocked(useUserPreferences).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);

    renderWithProviders(<SubscriptionPreferencesForm />);
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders auto-renew default switch with current value", () => {
    vi.mocked(useUserPreferences).mockReturnValue({
      data: { autoRenewDefault: true },
      isLoading: false,
    } as never);

    renderWithProviders(<SubscriptionPreferencesForm />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });

  it("renders auto-renew default switch as false when disabled", () => {
    vi.mocked(useUserPreferences).mockReturnValue({
      data: { autoRenewDefault: false },
      isLoading: false,
    } as never);

    renderWithProviders(<SubscriptionPreferencesForm />);
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  it("calls updateUserPreferences when switch is toggled", async () => {
    const user = userEvent.setup();
    vi.mocked(useUserPreferences).mockReturnValue({
      data: { autoRenewDefault: true },
      isLoading: false,
    } as never);
    mockMutateAsync.mockResolvedValue({ autoRenewDefault: false });

    renderWithProviders(<SubscriptionPreferencesForm />);
    await user.click(screen.getByRole("switch"));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ autoRenewDefault: false });
    });
  });

  it("renders description text about auto-renew", () => {
    vi.mocked(useUserPreferences).mockReturnValue({
      data: { autoRenewDefault: true },
      isLoading: false,
    } as never);

    renderWithProviders(<SubscriptionPreferencesForm />);
    expect(screen.getByText(/auto-renew/i)).toBeInTheDocument();
  });
});
