import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "@/app/(auth)/reset-password/page";
import { renderWithProviders } from "@/tests/test-utils";
import { toast } from "sonner";

const mockPush = vi.fn();

// Mutable ref so we can control what token useSearchParams returns per test
let mockToken: string | null = "abc123";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () =>
    new URLSearchParams(mockToken ? `token=${mockToken}` : ""),
  usePathname: () => "/reset-password",
}));

const { mockResetPassword } = vi.hoisted(() => ({
  mockResetPassword: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { resetPassword: mockResetPassword },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

describe("ResetPasswordPage — with valid token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken = "abc123";
    mockResetPassword.mockResolvedValue({ error: null });
  });

  it("renders password fields and submit button", () => {
    renderWithProviders(<ResetPasswordPage />);
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i }),
    ).toBeInTheDocument();
  });

  it("shows validation error when passwords don't match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/new password/i), "Password123!");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "Different123!",
    );
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/new password/i), "short");
    await user.type(screen.getByLabelText(/confirm password/i), "short");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(
        screen.getAllByText(/at least 8 characters/i).length,
      ).toBeGreaterThan(0);
    });
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("calls authClient.resetPassword with newPassword and token on valid submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/new password/i), "NewPass123!");
    await user.type(screen.getByLabelText(/confirm password/i), "NewPass123!");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          newPassword: "NewPass123!",
          token: "abc123",
        }),
      );
    });
  });

  it("redirects to /login on success", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/new password/i), "NewPass123!");
    await user.type(screen.getByLabelText(/confirm password/i), "NewPass123!");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows error toast for invalid/expired token", async () => {
    mockResetPassword.mockResolvedValue({
      error: { message: "Token expired" },
    });
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordPage />);
    await user.type(screen.getByLabelText(/new password/i), "NewPass123!");
    await user.type(screen.getByLabelText(/confirm password/i), "NewPass123!");
    await user.click(screen.getByRole("button", { name: /reset password/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Token expired");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("ResetPasswordPage — missing token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken = null;
  });

  it("shows error state with link to forgot-password when token is missing", () => {
    renderWithProviders(<ResetPasswordPage />);
    expect(screen.getByText(/invalid link/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /request a new reset link/i }),
    ).toBeInTheDocument();
  });
});
