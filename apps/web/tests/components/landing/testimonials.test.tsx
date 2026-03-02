import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Testimonials } from "@/components/landing/testimonials";

vi.mock("@/components/landing/motion/fade-in", () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/landing/motion/stagger-children", () => ({
  StaggerChildren: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  itemVariants: {},
}));

describe("Testimonials", () => {
  it("renders section heading", () => {
    render(<Testimonials />);
    expect(
      screen.getByRole("heading", { name: /what our users say/i }),
    ).toBeInTheDocument();
  });

  it("renders 3 testimonials", () => {
    render(<Testimonials />);
    // Each testimonial has a blockquote
    const quotes = screen.getAllByRole("blockquote");
    expect(quotes).toHaveLength(3);
  });

  it("each testimonial has a name", () => {
    render(<Testimonials />);
    expect(screen.getByText("Sarah M.")).toBeInTheDocument();
    expect(screen.getByText("James T.")).toBeInTheDocument();
    expect(screen.getByText("Priya K.")).toBeInTheDocument();
  });
});
