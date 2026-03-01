import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangeEmailForm } from "../change-email-form";
import { renderWithProviders } from "@/tests/test-utils";
import { toast } from "sonner";

vi.mock("@/hooks/use-change-email", () => ({
  useChangeEmail: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useChangeEmail } from "@/hooks/use-change-email";

const mockMutateAsync = vi.fn();

function setupMocks(isPending = false) {
  vi.mocked(useChangeEmail).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending,
  } as never);
}

describe("ChangeEmailForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
    setupMocks();
  });

  it("renders the new email input field", () => {
    renderWithProviders(<ChangeEmailForm />);
    expect(screen.getByLabelText(/new email address/i)).toBeTruthy();
  });

  it("renders the submit button", () => {
    renderWithProviders(<ChangeEmailForm />);
    expect(
      screen.getByRole("button", { name: /send verification email/i }),
    ).toBeTruthy();
  });

  it("shows validation error for empty email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangeEmailForm />);

    await user.click(
      screen.getByRole("button", { name: /send verification email/i }),
    );

    await waitFor(() =>
      expect(screen.getByText(/enter a valid email address/i)).toBeTruthy(),
    );
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("shows validation error for invalid email format", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangeEmailForm />);

    await user.type(screen.getByLabelText(/new email address/i), "not-email");
    await user.click(
      screen.getByRole("button", { name: /send verification email/i }),
    );

    await waitFor(() =>
      expect(screen.getByText(/enter a valid email address/i)).toBeTruthy(),
    );
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("calls useChangeEmail mutation with valid email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangeEmailForm />);

    await user.type(
      screen.getByLabelText(/new email address/i),
      "new@example.com",
    );
    await user.click(
      screen.getByRole("button", { name: /send verification email/i }),
    );

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ newEmail: "new@example.com" }),
      ),
    );
  });

  it("shows success message after successful submission", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangeEmailForm />);

    await user.type(
      screen.getByLabelText(/new email address/i),
      "new@example.com",
    );
    await user.click(
      screen.getByRole("button", { name: /send verification email/i }),
    );

    await waitFor(() =>
      expect(screen.getByText(/verification email sent to/i)).toBeTruthy(),
    );
    expect(screen.getByText("new@example.com")).toBeTruthy();
  });

  it("shows error toast when mutation fails", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue(new Error("Email already in use"));
    renderWithProviders(<ChangeEmailForm />);

    await user.type(
      screen.getByLabelText(/new email address/i),
      "taken@example.com",
    );
    await user.click(
      screen.getByRole("button", { name: /send verification email/i }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Email already in use"),
    );
  });

  it("disables submit button while pending", () => {
    setupMocks(true);
    renderWithProviders(<ChangeEmailForm />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
