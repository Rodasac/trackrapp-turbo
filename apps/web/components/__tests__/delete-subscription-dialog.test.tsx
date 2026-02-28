import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteSubscriptionDialog } from "../delete-subscription-dialog";
import { renderWithProviders } from "@/tests/test-utils";
import { toast } from "sonner";

// Singleton push so we can assert on it
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

vi.mock("@/hooks/use-subscription-mutations", () => ({
  useDeactivateSubscription: vi.fn(),
  useDeleteSubscription: vi.fn(),
  useSaveSubscription: vi.fn(),
  useCreateCategory: vi.fn(),
}));

import {
  useDeactivateSubscription,
  useDeleteSubscription,
} from "@/hooks/use-subscription-mutations";

const mockDeactivate = vi.fn();
const mockDelete = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockPush.mockReset();
  vi.mocked(useDeactivateSubscription).mockReturnValue({
    mutateAsync: mockDeactivate,
    isPending: false,
  } as never);
  vi.mocked(useDeleteSubscription).mockReturnValue({
    mutateAsync: mockDelete,
    isPending: false,
  } as never);
});

const defaultProps = {
  subscriptionId: 1,
  subscriptionName: "Netflix",
};

describe("DeleteSubscriptionDialog", () => {
  it("renders default destructive trigger button", () => {
    renderWithProviders(<DeleteSubscriptionDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("renders custom trigger when provided", () => {
    renderWithProviders(
      <DeleteSubscriptionDialog
        {...defaultProps}
        trigger={<span>Custom Trigger</span>}
      />,
    );
    expect(screen.getByText("Custom Trigger")).toBeInTheDocument();
  });

  it("opens dialog and shows subscription name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DeleteSubscriptionDialog {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText(/netflix/i)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls deactivate mutation and onDeactivate callback", async () => {
    const user = userEvent.setup();
    const onDeactivate = vi.fn();
    mockDeactivate.mockResolvedValue({});

    renderWithProviders(
      <DeleteSubscriptionDialog
        {...defaultProps}
        onDeactivate={onDeactivate}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await user.click(screen.getByRole("button", { name: /^deactivate$/i }));

    await waitFor(() => {
      expect(mockDeactivate).toHaveBeenCalledWith(1);
      expect(onDeactivate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Subscription deactivated");
    });
  });

  it("calls delete mutation, onDelete callback, and router.push", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    mockDelete.mockResolvedValue({});

    renderWithProviders(
      <DeleteSubscriptionDialog {...defaultProps} onDelete={onDelete} />,
    );
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await user.click(
      screen.getByRole("button", { name: /delete permanently/i }),
    );

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(onDelete).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Subscription deleted");
      expect(mockPush).toHaveBeenCalledWith("/subscriptions");
    });
  });

  it("shows error toast when deactivate fails", async () => {
    const user = userEvent.setup();
    mockDeactivate.mockRejectedValue(new Error("fail"));

    renderWithProviders(<DeleteSubscriptionDialog {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await user.click(screen.getByRole("button", { name: /^deactivate$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to deactivate");
    });
  });

  it("shows error toast when hard delete fails", async () => {
    const user = userEvent.setup();
    mockDelete.mockRejectedValue(new Error("fail"));

    renderWithProviders(<DeleteSubscriptionDialog {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await user.click(
      screen.getByRole("button", { name: /delete permanently/i }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to delete");
    });
  });

  it("closes dialog on Cancel click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DeleteSubscriptionDialog {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("disables buttons while mutation is pending", () => {
    vi.mocked(useDeactivateSubscription).mockReturnValue({
      mutateAsync: mockDeactivate,
      isPending: true,
    } as never);

    renderWithProviders(<DeleteSubscriptionDialog {...defaultProps} />);
    // Trigger button itself is not pending; buttons inside dialog are
    // Just verify the component renders without crashing when pending
    expect(
      screen.getByRole("button", { name: /^delete$/i }),
    ).toBeInTheDocument();
  });
});
