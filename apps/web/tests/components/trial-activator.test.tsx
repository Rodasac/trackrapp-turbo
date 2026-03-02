import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { TrialActivator } from "@/components/trial-activator";
import { renderWithProviders } from "@/tests/test-utils";

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(),
}));

vi.mock("@/hooks/use-subscription-plan-mutations", () => ({
  useUpgradeToPro: vi.fn(),
}));

import { useSession } from "@/lib/auth-client";
import { useUpgradeToPro } from "@/hooks/use-subscription-plan-mutations";

const mockMutateAsync = vi.fn();

function setupWithSession() {
  vi.mocked(useSession).mockReturnValue({
    data: { user: { id: "user-1" }, session: {} },
  } as never);
  vi.mocked(useUpgradeToPro).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as never);
}

function setupNoSession() {
  vi.mocked(useSession).mockReturnValue({ data: null } as never);
  vi.mocked(useUpgradeToPro).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as never);
}

describe("TrialActivator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders nothing", () => {
    setupNoSession();
    const { container } = renderWithProviders(<TrialActivator />);
    expect(container.firstChild).toBeNull();
  });

  it("does nothing when no pending_trial in localStorage", async () => {
    setupWithSession();
    renderWithProviders(<TrialActivator />);
    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  it("does nothing when session is absent even if pending_trial is set", async () => {
    setupNoSession();
    localStorage.setItem("pending_trial", "pro");
    renderWithProviders(<TrialActivator />);
    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  it("calls upgrade.mutateAsync when pending_trial=pro and session exists", async () => {
    setupWithSession();
    localStorage.setItem("pending_trial", "pro");
    renderWithProviders(<TrialActivator />);
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ annual: false }),
      );
    });
  });

  it("clears pending_trial from localStorage before triggering upgrade", async () => {
    setupWithSession();
    localStorage.setItem("pending_trial", "pro");
    renderWithProviders(<TrialActivator />);
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
    expect(localStorage.getItem("pending_trial")).toBeNull();
  });

  it("does not trigger upgrade twice on re-render", async () => {
    setupWithSession();
    localStorage.setItem("pending_trial", "pro");
    const { rerender } = renderWithProviders(<TrialActivator />);
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
    rerender(<TrialActivator />);
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  it("does not throw when upgrade fails", async () => {
    setupWithSession();
    mockMutateAsync.mockRejectedValue(new Error("Stripe error"));
    localStorage.setItem("pending_trial", "pro");
    // Should not throw
    expect(() => renderWithProviders(<TrialActivator />)).not.toThrow();
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });
});
