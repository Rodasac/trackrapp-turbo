import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationPreferencesForm } from "../notification-preferences-form";
import { renderWithProviders } from "@/tests/test-utils";
import { mockNotificationPreferences } from "@/tests/fixtures";
import { toast } from "sonner";

// Mock hooks
vi.mock("@/hooks/use-notification-preferences", () => ({
  useNotificationPreferences: vi.fn(),
}));
vi.mock("@/hooks/use-notification-mutations", () => ({
  useUpdateNotificationPreferences: vi.fn(),
  useSubscribeToPush: vi.fn(),
  useUnsubscribeFromPush: vi.fn(),
}));
// Mock PushNotificationManager to avoid browser API surface
vi.mock("@/components/push-notification-manager", () => ({
  PushNotificationManager: () => (
    <div data-testid="push-manager">Push manager</div>
  ),
}));
// Mock Switch to avoid Radix UI ResizeObserver constructor issue in jsdom
vi.mock("@repo/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
  }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
    />
  ),
}));

import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import {
  useUpdateNotificationPreferences,
  useSubscribeToPush,
  useUnsubscribeFromPush,
} from "@/hooks/use-notification-mutations";

const mockMutateAsync = vi.fn().mockResolvedValue({});

function setupMocks(
  prefsOverrides?: Parameters<typeof mockNotificationPreferences>[0],
) {
  vi.mocked(useNotificationPreferences).mockReturnValue({
    data: mockNotificationPreferences(prefsOverrides),
    isLoading: false,
  } as never);
  vi.mocked(useUpdateNotificationPreferences).mockReturnValue({
    mutateAsync: mockMutateAsync,
  } as never);
  vi.mocked(useSubscribeToPush).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
  vi.mocked(useUnsubscribeFromPush).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
}

describe("NotificationPreferencesForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
    setupMocks();
  });

  it("renders loading skeleton when isLoading is true", () => {
    vi.mocked(useNotificationPreferences).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);
    const { container } = renderWithProviders(<NotificationPreferencesForm />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders email and push toggles", () => {
    renderWithProviders(<NotificationPreferencesForm />);
    expect(screen.getByText("Email reminders")).toBeInTheDocument();
    expect(screen.getByText("Browser push notifications")).toBeInTheDocument();
  });

  it("renders reminder day pill buttons", () => {
    renderWithProviders(<NotificationPreferencesForm />);
    expect(screen.getByText("7 days")).toBeInTheDocument();
    expect(screen.getByText("3 days")).toBeInTheDocument();
    expect(screen.getByText("1 day")).toBeInTheDocument();
    expect(screen.getByText("14 days")).toBeInTheDocument();
    expect(screen.getByText("30 days")).toBeInTheDocument();
  });

  it("reflects loaded preferences in form (emailEnabled=false)", async () => {
    setupMocks({ emailEnabled: false });
    renderWithProviders(<NotificationPreferencesForm />);
    // Wait for the useEffect to reset form with loaded prefs
    await waitFor(() => {
      const switches = screen.getAllByRole("switch");
      // First switch = email, should be unchecked
      expect(switches[0]).toHaveAttribute("aria-checked", "false");
    });
  });

  it("shows push manager when push toggle is turned on", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationPreferencesForm />);
    // Push is off by default in fixtures (pushEnabled: false)
    expect(screen.queryByTestId("push-manager")).toBeNull();

    const switches = screen.getAllByRole("switch");
    await user.click(switches[1]!); // Push toggle is second switch
    await waitFor(() => {
      expect(screen.getByTestId("push-manager")).toBeInTheDocument();
    });
  });

  it("submits updated preferences on save", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationPreferencesForm />);

    await user.click(screen.getByRole("button", { name: /save preferences/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        emailEnabled: true,
        pushEnabled: false,
        reminderDaysBefore: [7, 3, 1],
      });
    });
  });

  it("shows success toast after saving", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationPreferencesForm />);

    await user.click(screen.getByRole("button", { name: /save preferences/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Notification preferences saved",
      );
    });
  });

  it("shows error toast when save fails", async () => {
    mockMutateAsync.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    renderWithProviders(<NotificationPreferencesForm />);

    await user.click(screen.getByRole("button", { name: /save preferences/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to save preferences");
    });
  });

  it("toggles a day pill on click (deselect 7 days)", async () => {
    // Start with [7, 3, 1]; clicking 7 should remove it (leaving [3, 1])
    setupMocks({ reminderDaysBefore: [7, 3, 1] });
    const user = userEvent.setup();
    renderWithProviders(<NotificationPreferencesForm />);

    await user.click(screen.getByRole("button", { name: /save preferences/i }));
    vi.mocked(mockMutateAsync).mockClear();

    // Click 7 days to deselect it
    await user.click(screen.getByText("7 days"));
    await user.click(screen.getByRole("button", { name: /save preferences/i }));

    await waitFor(() => {
      const call = mockMutateAsync.mock.calls[0]![0] as {
        reminderDaysBefore: number[];
      };
      expect(call.reminderDaysBefore).not.toContain(7);
    });
  });

  it("does not deselect the last remaining day pill", async () => {
    // Start with only [1]; clicking 1 should keep it (minimum 1 selection)
    setupMocks({ reminderDaysBefore: [1] });
    const user = userEvent.setup();
    renderWithProviders(<NotificationPreferencesForm />);

    await user.click(screen.getByText("1 day"));
    await user.click(screen.getByRole("button", { name: /save preferences/i }));

    await waitFor(() => {
      const call = mockMutateAsync.mock.calls[0]![0] as {
        reminderDaysBefore: number[];
      };
      expect(call.reminderDaysBefore).toContain(1);
      expect(call.reminderDaysBefore).toHaveLength(1);
    });
  });
});
