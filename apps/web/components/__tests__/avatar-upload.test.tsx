import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvatarUpload } from "../avatar-upload";
import { renderWithProviders } from "@/tests/test-utils";

const { mockStartUpload, mockUseUploadThing } = vi.hoisted(() => {
  const mockStartUpload = vi.fn();
  const mockUseUploadThing = vi.fn(() => ({
    startUpload: mockStartUpload,
    isUploading: false,
  }));
  return { mockStartUpload, mockUseUploadThing };
});

vi.mock("@/lib/uploadthing", () => ({
  useUploadThing: mockUseUploadThing,
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { toast } from "sonner";

describe("AvatarUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStartUpload.mockResolvedValue([]);
    mockUseUploadThing.mockReturnValue({
      startUpload: mockStartUpload,
      isUploading: false,
    });
  });

  it("renders the current avatar image when provided", () => {
    renderWithProviders(
      <AvatarUpload
        image="https://example.com/avatar.jpg"
        name="Jane Doe"
        onUploadComplete={vi.fn()}
      />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("avatar.jpg"));
  });

  it("shows initials fallback when no image is provided", () => {
    renderWithProviders(
      <AvatarUpload name="Jane Doe" onUploadComplete={vi.fn()} />,
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("JD")).toBeTruthy();
  });

  it("shows single initial for single-word name", () => {
    renderWithProviders(
      <AvatarUpload name="Jane" onUploadComplete={vi.fn()} />,
    );
    expect(screen.getByText("J")).toBeTruthy();
  });

  it("shows the change photo button", () => {
    renderWithProviders(
      <AvatarUpload name="Jane" onUploadComplete={vi.fn()} />,
    );
    expect(
      screen.getByRole("button", { name: /change photo/i }),
    ).toBeTruthy();
  });

  it("calls onUploadComplete with the uploaded file URL on success", async () => {
    const user = userEvent.setup();
    const onUploadComplete = vi.fn();
    mockStartUpload.mockResolvedValue([
      { ufsUrl: "https://utfs.io/f/newavatar.jpg" },
    ]);

    renderWithProviders(
      <AvatarUpload name="Jane" onUploadComplete={onUploadComplete} />,
    );

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    await user.upload(fileInput, file);

    await waitFor(() =>
      expect(onUploadComplete).toHaveBeenCalledWith(
        "https://utfs.io/f/newavatar.jpg",
      ),
    );
  });

  it("shows an error toast when upload fails", async () => {
    const user = userEvent.setup();
    mockStartUpload.mockRejectedValue(new Error("Upload failed"));

    renderWithProviders(
      <AvatarUpload name="Jane" onUploadComplete={vi.fn()} />,
    );

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    await user.upload(fileInput, file);

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it("disables the button while uploading", () => {
    mockUseUploadThing.mockReturnValue({
      startUpload: mockStartUpload,
      isUploading: true,
    });

    renderWithProviders(
      <AvatarUpload name="Jane" onUploadComplete={vi.fn()} />,
    );

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });
});
