import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CtaBanner } from "@/components/landing/cta-banner";

vi.mock("@/components/landing/motion/fade-in", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("CtaBanner", () => {
  it("renders heading", () => {
    render(<CtaBanner />);
    expect(
      screen.getByRole("heading", {
        name: /ready to take control/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders Start free CTA linking to /signup", () => {
    render(<CtaBanner />);
    expect(screen.getByRole("link", { name: /start free/i })).toHaveAttribute(
      "href",
      "/signup",
    );
  });
});
