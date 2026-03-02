import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/landing/hero-section";

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      className,
      ...rest
    }: {
      children?: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div className={className} {...rest}>
        {children}
      </div>
    ),
    h1: ({
      children,
      className,
      ...rest
    }: {
      children?: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <h1 className={className} {...rest}>
        {children}
      </h1>
    ),
  },
}));

vi.mock("@/components/landing/motion/fade-in", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/landing/app-mockup", () => ({
  AppMockup: () => <div data-testid="app-mockup" />,
}));

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

  it("renders app mockup", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("app-mockup")).toBeInTheDocument();
  });
});
