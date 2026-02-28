import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/landing/hero-section";

describe("HeroSection", () => {
  it("renders headline text", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("heading", { name: /track every subscription/i }),
    ).toBeInTheDocument();
  });

  it("renders subheadline text", () => {
    render(<HeroSection />);
    expect(screen.getByText(/never miss a renewal/i)).toBeInTheDocument();
  });

  it("renders 'Start free' CTA linking to /signup", () => {
    render(<HeroSection />);
    expect(screen.getByRole("link", { name: /start free/i })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("renders 'See pricing' CTA linking to #pricing", () => {
    render(<HeroSection />);
    expect(screen.getByRole("link", { name: /see pricing/i })).toHaveAttribute(
      "href",
      "#pricing",
    );
  });
});
