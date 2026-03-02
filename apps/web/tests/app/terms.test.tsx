import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TermsPage from "@/app/terms/page";

describe("Terms of Service page", () => {
  it("renders main heading", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: /terms of service/i }),
    ).toBeInTheDocument();
  });

  it("renders Acceptance of Terms section", () => {
    render(<TermsPage />);
    expect(screen.getByText(/acceptance of terms/i)).toBeInTheDocument();
  });

  it("renders Limitation of Liability section", () => {
    render(<TermsPage />);
    expect(screen.getByText(/limitation of liability/i)).toBeInTheDocument();
  });

  it("renders contact info", () => {
    render(<TermsPage />);
    expect(screen.getByText(/legal@trackrapp/i)).toBeInTheDocument();
  });
});
