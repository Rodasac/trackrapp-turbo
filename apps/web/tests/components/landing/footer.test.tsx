import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/landing/footer";

describe("Footer", () => {
  it("renders TrackrApp logo and brand text", () => {
    render(<Footer />);
    expect(screen.getByText("TrackrApp")).toBeInTheDocument();
  });

  it("renders copyright with current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument();
  });

  it("renders product navigation links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /features/i })).toHaveAttribute(
      "href",
      "/#features",
    );
    expect(screen.getByRole("link", { name: /pricing/i })).toHaveAttribute(
      "href",
      "/#pricing",
    );
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("renders Terms of Service link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /terms of service/i }),
    ).toHaveAttribute("href", "/terms");
  });

  it("renders Privacy Policy link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /privacy policy/i }),
    ).toHaveAttribute("href", "/privacy");
  });

  it("renders Cookie Policy link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /cookie policy/i }),
    ).toHaveAttribute("href", "/cookies");
  });
});
