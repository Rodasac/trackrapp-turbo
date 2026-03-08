import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/[locale]/(auth)/login/page";
import { renderWithProviders } from "@/tests/test-utils";
import { toast } from "sonner";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/login",
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => "/login",
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

const { mockSignInEmail, mockSendVerificationEmail } = vi.hoisted(() => ({
  mockSignInEmail: vi.fn(),
  mockSendVerificationEmail: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  signIn: { email: mockSignInEmail },
  authClient: { sendVerificationEmail: mockSendVerificationEmail },
}));

vi.mock("@/components/auth/google-sign-in-button", () => ({
  GoogleSignInButton: ({ label }: { label?: string }) => (
    <button type="button">{label ?? "Continue with Google"}</button>
  ),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInEmail.mockResolvedValue({ error: null });
    mockSendVerificationEmail.mockResolvedValue({ error: null });
  });

  it("renders email and password fields and submit button", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("renders Forgot password link to /forgot-password", () => {
    renderWithProviders(<LoginPage />);
    const link = screen.getByRole("link", { name: /forgot password/i });
    expect(link).toHaveAttribute("href", "/forgot-password");
  });

  it("renders Google sign-in button", () => {
    renderWithProviders(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });

  it("renders Sign up link", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => {
      expect(
        screen.getByText("Enter a valid email address"),
      ).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
    expect(mockSignInEmail).not.toHaveBeenCalled();
  });

  it("calls signIn.email and redirects to /dashboard on success", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error toast on sign-in failure", async () => {
    mockSignInEmail.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows unverified email banner on email-not-verified error", async () => {
    mockSignInEmail.mockResolvedValue({
      error: { code: "EMAIL_NOT_VERIFIED" },
    });
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), "unverified@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => {
      expect(
        screen.getByText(/please verify your email first/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/unverified@example\.com/)).toBeInTheDocument();
    });
  });

  it("resend verification email button calls sendVerificationEmail", async () => {
    mockSignInEmail.mockResolvedValue({
      error: { code: "EMAIL_NOT_VERIFIED" },
    });
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), "unverified@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      screen.getByRole("button", { name: /resend verification email/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /resend verification email/i }),
    );
    await waitFor(() => {
      expect(mockSendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: "unverified@example.com" }),
      );
    });
  });
});
