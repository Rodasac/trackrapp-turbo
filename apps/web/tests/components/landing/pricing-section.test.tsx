import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PricingSection } from "@/components/landing/pricing-section";

// PricingSection now delegates to PricingCards + FadeIn
vi.mock("@/components/landing/motion/fade-in", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/landing/pricing-cards", () => ({
  PricingCards: () => (
    <div data-testid="pricing-cards">
      <span>Free</span>
      <span>Pro</span>
      <span>Most popular</span>
    </div>
  ),
}));

describe("PricingSection", () => {
  it("renders section heading", () => {
    render(<PricingSection />);
    expect(
      screen.getByRole("heading", { name: /simple pricing/i }),
    ).toBeInTheDocument();
  });

  it("renders Free and Pro plan cards via PricingCards", () => {
    render(<PricingSection />);
    expect(screen.getByTestId("pricing-cards")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("renders in a #pricing anchored section", () => {
    render(<PricingSection />);
    const section = document.getElementById("pricing");
    expect(section).toBeInTheDocument();
  });
});
