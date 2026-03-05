import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "@/app/[locale]/(auth)/forgot-password/page";
import { renderWithProviders } from "@/tests/test-utils";
import { toast } from "sonner";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/forgot-password",
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => "/forgot-password",
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const { mockRequestPasswordReset } = vi.hoisted(() => ({
  mockRequestPasswordReset: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { requestPasswordReset: mockRequestPasswordReset },
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestPasswordReset.mockResolvedValue({ error: null });
  });

  it("renders email field, submit button, and back link", () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to sign in/i }),
    ).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Enter a valid email address"),
      ).toBeInTheDocument();
    });
    expect(mockRequestPasswordReset).not.toHaveBeenCalled();
  });

  it("calls authClient.requestPasswordReset and redirects on success", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({ email: "user@example.com" }),
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/check-email-reset"),
      );
    });
  });

  it("shows error toast on failure", async () => {
    mockRequestPasswordReset.mockResolvedValue({
      error: { message: "User not found" },
    });
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email/i), "nobody@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("User not found");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
