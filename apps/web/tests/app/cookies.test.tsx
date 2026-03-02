import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CookiesPage from "@/app/cookies/page";

describe("Cookie Policy page", () => {
  it("renders main heading", () => {
    render(<CookiesPage />);
    expect(
      screen.getByRole("heading", { name: /cookie policy/i }),
    ).toBeInTheDocument();
  });

  it("renders What Are Cookies section", () => {
    render(<CookiesPage />);
    expect(screen.getByText(/what are cookies/i)).toBeInTheDocument();
  });

  it("renders GDPR rights section", () => {
    render(<CookiesPage />);
    // "GDPR" appears in both heading and body text
    const gdprElements = screen.getAllByText(/gdpr/i);
    expect(gdprElements.length).toBeGreaterThan(0);
  });

  it("renders contact info", () => {
    render(<CookiesPage />);
    expect(screen.getByText(/privacy@trackrapp/i)).toBeInTheDocument();
  });
});
