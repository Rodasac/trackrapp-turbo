import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePasswordForm } from "../change-password-form";
import { renderWithProviders } from "@/tests/test-utils";
import { toast } from "sonner";

vi.mock("@/hooks/use-profile-mutations", () => ({
  useChangePassword: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useChangePassword } from "@/hooks/use-profile-mutations";

const mockMutateAsync = vi.fn();

function setupMocks() {
  vi.mocked(useChangePassword).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as never);
}

const VALID_PASSWORD = "NewPass123!";

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
    setupMocks();
  });

  it("renders three password fields", () => {
    renderWithProviders(<ChangePasswordForm />);
    expect(screen.getByLabelText(/current password/i)).toBeTruthy();
    expect(screen.getByLabelText("New password")).toBeTruthy();
    expect(screen.getByLabelText(/confirm new password/i)).toBeTruthy();
  });

  it("renders a submit button", () => {
    renderWithProviders(<ChangePasswordForm />);
    expect(
      screen.getByRole("button", { name: /change password/i }),
    ).toBeTruthy();
  });

  it("shows validation error when new password is too short", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordForm />);

    await user.type(screen.getByLabelText(/current password/i), "OldPass1!");
    await user.type(screen.getByLabelText("New password"), "short");
    await user.type(screen.getByLabelText(/confirm new password/i), "short");
    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() =>
      expect(screen.getAllByText(/at least 8 characters/i).length).toBeGreaterThan(0),
    );
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("shows validation error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordForm />);

    await user.type(screen.getByLabelText(/current password/i), "OldPass1!");
    await user.type(screen.getByLabelText("New password"), VALID_PASSWORD);
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "Different123@",
    );
    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() =>
      expect(screen.getByText(/passwords must match/i)).toBeTruthy(),
    );
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("calls useChangePassword mutation on valid submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordForm />);

    await user.type(screen.getByLabelText(/current password/i), "OldPass1!");
    await user.type(screen.getByLabelText("New password"), VALID_PASSWORD);
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      VALID_PASSWORD,
    );
    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          currentPassword: "OldPass1!",
          newPassword: VALID_PASSWORD,
        }),
      ),
    );
  });

  it("shows success toast and resets form on success", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordForm />);

    await user.type(screen.getByLabelText(/current password/i), "OldPass1!");
    await user.type(screen.getByLabelText("New password"), VALID_PASSWORD);
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      VALID_PASSWORD,
    );
    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());

    // Fields should be cleared after success
    expect(
      (screen.getByLabelText(/current password/i) as HTMLInputElement).value,
    ).toBe("");
  });

  it("shows error toast when mutation fails", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue(new Error("Incorrect password"));
    renderWithProviders(<ChangePasswordForm />);

    await user.type(screen.getByLabelText(/current password/i), "WrongPass1!");
    await user.type(screen.getByLabelText("New password"), VALID_PASSWORD);
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      VALID_PASSWORD,
    );
    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it("disables submit button while submitting", () => {
    vi.mocked(useChangePassword).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as never);

    renderWithProviders(<ChangePasswordForm />);

    // When isPending, button text changes to "Saving…" and is disabled
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });
});
