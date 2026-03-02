import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoogleSignInButton } from "../auth/google-sign-in-button";

const { mockSignInSocial } = vi.hoisted(() => ({
  mockSignInSocial: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  signIn: {
    social: mockSignInSocial,
  },
}));

describe("GoogleSignInButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInSocial.mockResolvedValue({});
  });

  it("renders with default label", () => {
    render(<GoogleSignInButton />);
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<GoogleSignInButton label="Sign in with Google" />);
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });

  it("calls signIn.social with google provider on click", async () => {
    const user = userEvent.setup();
    render(<GoogleSignInButton />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(mockSignInSocial).toHaveBeenCalledWith({ provider: "google" });
    });
  });

  it("disables button while pending", async () => {
    mockSignInSocial.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<GoogleSignInButton />);
    const btn = screen.getByRole("button");
    await user.click(btn);
    expect(btn).toBeDisabled();
  });
});
