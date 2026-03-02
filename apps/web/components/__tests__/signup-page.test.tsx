import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "@/app/(auth)/signup/page";
import { renderWithProviders } from "@/tests/test-utils";
import { toast } from "sonner";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/signup",
}));

const { mockSignUpEmail } = vi.hoisted(() => ({
  mockSignUpEmail: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  signUp: { email: mockSignUpEmail },
}));

vi.mock("@/components/auth/google-sign-in-button", () => ({
  GoogleSignInButton: ({ label }: { label?: string }) => (
    <button type="button">{label ?? "Continue with Google"}</button>
  ),
}));

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUpEmail.mockResolvedValue({ error: null });
  });

  it("renders name, email, and password fields with submit button", () => {
    renderWithProviders(<SignupPage />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("renders Google sign-up button", () => {
    renderWithProviders(<SignupPage />);
    expect(
      screen.getByRole("button", { name: /sign up with google/i }),
    ).toBeInTheDocument();
  });

  it("renders Sign in link", () => {
    renderWithProviders(<SignupPage />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupPage />);
    await user.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Name must be at least 2 characters"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Enter a valid email address"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
    });
    expect(mockSignUpEmail).not.toHaveBeenCalled();
  });

  it("calls signUp.email and redirects to /check-email on success", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupPage />);
    await user.type(screen.getByLabelText(/name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        name: "Jane Smith",
        email: "jane@example.com",
        password: "Password123!",
      });
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/check-email"),
      );
    });
  });

  it("shows error toast on sign-up failure", async () => {
    mockSignUpEmail.mockResolvedValue({ error: { message: "Email taken" } });
    const user = userEvent.setup();
    renderWithProviders(<SignupPage />);
    await user.type(screen.getByLabelText(/name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email taken");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
