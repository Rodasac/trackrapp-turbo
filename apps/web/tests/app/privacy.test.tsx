import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage from "@/app/privacy/page";

describe("Privacy Policy page", () => {
  it("renders main heading", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole("heading", { name: /privacy policy/i }),
    ).toBeInTheDocument();
  });

  it("renders Information We Collect section", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/information we collect/i)).toBeInTheDocument();
  });

  it("renders Your Rights section", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/your rights/i)).toBeInTheDocument();
  });

  it("renders contact info", () => {
    render(<PrivacyPage />);
    // Email appears as link text — could appear multiple times
    const contactLinks = screen.getAllByText(/privacy@trackrapp/i);
    expect(contactLinks.length).toBeGreaterThan(0);
  });
});
