import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckEmailResetPage from "@/app/[locale]/(auth)/check-email-reset/page";
import { renderWithProviders } from "@/tests/test-utils";
import { toast } from "sonner";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("email=user%40example.com"),
  usePathname: () => "/check-email-reset",
}));

const { mockRequestPasswordReset } = vi.hoisted(() => ({
  mockRequestPasswordReset: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { requestPasswordReset: mockRequestPasswordReset },
}));

describe("CheckEmailResetPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestPasswordReset.mockResolvedValue({ error: null });
  });

  it("renders heading, email, resend button, and back link", () => {
    renderWithProviders(<CheckEmailResetPage />);
    expect(
      screen.getByRole("heading", { name: /check your email/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /resend email/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to sign in/i }),
    ).toBeInTheDocument();
  });

  it("calls authClient.requestPasswordReset on resend click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckEmailResetPage />);
    await user.click(screen.getByRole("button", { name: /resend email/i }));
    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({ email: "user@example.com" }),
      );
    });
  });

  it("shows success toast on successful resend", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckEmailResetPage />);
    await user.click(screen.getByRole("button", { name: /resend email/i }));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
