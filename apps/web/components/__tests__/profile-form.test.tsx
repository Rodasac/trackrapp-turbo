import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "../profile-form";
import { renderWithProviders } from "@/tests/test-utils";
import { toast } from "sonner";

// Mock auth client for session
vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(),
  authClient: {
    updateUser: vi.fn(),
  },
}));

// Mock hooks
vi.mock("@/hooks/use-account-provider", () => ({
  useAccountProvider: vi.fn(),
}));
vi.mock("@/hooks/use-profile-mutations", () => ({
  useUpdateProfile: vi.fn(),
}));

// Mock child components to isolate orchestrator
vi.mock("@/components/avatar-upload", () => ({
  AvatarUpload: ({
    name,
    onUploadComplete,
  }: {
    name: string;
    image?: string | null;
    onUploadComplete: (url: string) => void;
  }) => (
    <div data-testid="avatar-upload">
      <span>{name}</span>
      <button
        onClick={() => onUploadComplete("https://utfs.io/f/new-avatar.jpg")}
      >
        Upload avatar
      </button>
    </div>
  ),
}));
vi.mock("@/components/change-password-form", () => ({
  ChangePasswordForm: () => (
    <div data-testid="change-password-form">Change Password Form</div>
  ),
}));
vi.mock("@/components/change-email-form", () => ({
  ChangeEmailForm: () => (
    <div data-testid="change-email-form">Change Email Form</div>
  ),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useSession } from "@/lib/auth-client";
import { useAccountProvider } from "@/hooks/use-account-provider";
import { useUpdateProfile } from "@/hooks/use-profile-mutations";

const mockMutateAsync = vi.fn();

function setupMocks({
  name = "Test User",
  image = null,
  provider = "credential" as "credential" | "google",
  loading = false,
} = {}) {
  vi.mocked(useSession).mockReturnValue({
    data: loading
      ? null
      : {
          user: { id: "user-1", name, image, email: "test@example.com" },
          session: {},
        },
    isPending: loading,
  } as never);

  vi.mocked(useAccountProvider).mockReturnValue({
    data: loading ? undefined : { provider },
    isLoading: loading,
  } as never);

  vi.mocked(useUpdateProfile).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as never);
}

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
    setupMocks();
  });

  it("renders the name input pre-populated from session", () => {
    setupMocks({ name: "Jane Doe" });
    renderWithProviders(<ProfileForm />);
    expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe(
      "Jane Doe",
    );
  });

  it("renders the avatar upload section", () => {
    renderWithProviders(<ProfileForm />);
    expect(screen.getByTestId("avatar-upload")).toBeTruthy();
  });

  it("shows ChangePasswordForm when provider is credential", () => {
    setupMocks({ provider: "credential" });
    renderWithProviders(<ProfileForm />);
    expect(screen.getByTestId("change-password-form")).toBeTruthy();
  });

  it("hides ChangePasswordForm when provider is google", () => {
    setupMocks({ provider: "google" });
    renderWithProviders(<ProfileForm />);
    expect(screen.queryByTestId("change-password-form")).toBeNull();
  });

  it("shows loading skeleton while session is loading", () => {
    setupMocks({ loading: true });
    const { container } = renderWithProviders(<ProfileForm />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("calls useUpdateProfile with the name on submit", async () => {
    const user = userEvent.setup();
    setupMocks({ name: "Jane Doe" });
    renderWithProviders(<ProfileForm />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Jane Smith");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Jane Smith" }),
      ),
    );
  });

  it("immediately saves image to DB when avatar is uploaded", async () => {
    const user = userEvent.setup();
    setupMocks({ name: "Jane" });
    renderWithProviders(<ProfileForm />);

    // Trigger the avatar upload (mocked button sets the URL)
    await user.click(screen.getByRole("button", { name: /upload avatar/i }));

    // Should save immediately — no need to click Save
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          image: "https://utfs.io/f/new-avatar.jpg",
        }),
      ),
    );
  });

  it("shows Photo updated toast when avatar upload completes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileForm />);

    await user.click(screen.getByRole("button", { name: /upload avatar/i }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Photo updated"),
    );
  });

  it("shows success toast on save", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfileForm />);

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("shows error toast when save fails", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue(new Error("Save failed"));
    renderWithProviders(<ProfileForm />);

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it("shows current email from session", () => {
    setupMocks({ provider: "credential" });
    renderWithProviders(<ProfileForm />);
    expect(screen.getByText("test@example.com")).toBeTruthy();
  });

  it("shows Change email button for credential users", () => {
    setupMocks({ provider: "credential" });
    renderWithProviders(<ProfileForm />);
    expect(
      screen.getByRole("button", { name: /change email/i }),
    ).toBeTruthy();
  });

  it("does not show Change email button for Google users", () => {
    setupMocks({ provider: "google" });
    renderWithProviders(<ProfileForm />);
    expect(
      screen.queryByRole("button", { name: /change email/i }),
    ).toBeNull();
  });

  it("reveals ChangeEmailForm when Change email button is clicked", async () => {
    const user = userEvent.setup();
    setupMocks({ provider: "credential" });
    renderWithProviders(<ProfileForm />);

    expect(screen.queryByTestId("change-email-form")).toBeNull();
    await user.click(screen.getByRole("button", { name: /change email/i }));
    expect(screen.getByTestId("change-email-form")).toBeTruthy();
  });
});
